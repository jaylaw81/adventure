import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, adventures, deletedAccounts } from '@/lib/schema'
import { stripe } from '@/lib/stripe'
import { ACQUISITION_SOURCES } from '@/lib/acquisitionSources'
import { validateUsername } from '@/lib/username'
import { getFollowerCount, getFollowingCount } from '@/lib/queries'

const VALID_SOURCES = new Set(ACQUISITION_SOURCES.map(s => s.value))

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return session
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email!))
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [[{ count: storyCount }], followerCount, followingCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(adventures).where(eq(adventures.userEmail, user.email)),
    getFollowerCount(user.email),
    getFollowingCount(user.email),
  ])

  return NextResponse.json({
    email: user.email,
    displayName: user.displayName,
    birthDate: user.birthDate ?? null,
    languagePreference: user.languagePreference ?? 'en',
    username: user.username ?? null,
    profileVisible: user.profileVisible,
    createdAt: user.createdAt,
    image: session.user.image ?? null,
    storyCount,
    followerCount,
    followingCount,
  })
}

export async function PUT(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { displayName, birthDate, acquisitionSource, languagePreference, username, profileVisible } = body

  if (displayName !== undefined && (typeof displayName !== 'string' || !displayName.trim())) {
    return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
  }
  if (birthDate !== undefined && (typeof birthDate !== 'string' || !birthDate.match(/^\d{4}-\d{2}-\d{2}$/))) {
    return NextResponse.json({ error: 'Invalid birthDate format' }, { status: 400 })
  }
  if (acquisitionSource !== undefined && acquisitionSource !== null && !VALID_SOURCES.has(acquisitionSource)) {
    return NextResponse.json({ error: 'Invalid acquisitionSource' }, { status: 400 })
  }
  if (languagePreference !== undefined && typeof languagePreference !== 'string') {
    return NextResponse.json({ error: 'Invalid languagePreference' }, { status: 400 })
  }
  if (profileVisible !== undefined && typeof profileVisible !== 'boolean') {
    return NextResponse.json({ error: 'Invalid profileVisible' }, { status: 400 })
  }

  let normalizedUsername: string | undefined
  if (username !== undefined) {
    if (typeof username !== 'string') {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
    }
    normalizedUsername = username.trim().toLowerCase()
    const formatError = validateUsername(normalizedUsername)
    if (formatError) {
      return NextResponse.json({ error: formatError }, { status: 400 })
    }
    const [existing] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.username, normalizedUsername))
    if (existing && existing.email !== session.user.email) {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }
  }

  const updateData: {
    displayName?: string
    birthDate?: string
    acquisitionSource?: string | null
    languagePreference?: string
    username?: string
    profileVisible?: boolean
  } = {}
  if (displayName !== undefined) updateData.displayName = displayName.trim()
  if (birthDate !== undefined) updateData.birthDate = birthDate
  if (acquisitionSource !== undefined) updateData.acquisitionSource = acquisitionSource || null
  if (languagePreference !== undefined) updateData.languagePreference = languagePreference || 'en'
  if (normalizedUsername !== undefined) updateData.username = normalizedUsername
  if (profileVisible !== undefined) updateData.profileVisible = profileVisible

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.email, session.user.email!))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = session.user.email!

  const [user] = await db
    .select({
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      trialEndsAt: users.trialEndsAt,
      grandfathered: users.grandfathered,
    })
    .from(users)
    .where(eq(users.email, email))

  // Cancel Stripe subscription if one exists
  if (user?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId)
    } catch {
      // Don't block account deletion if Stripe cancel fails (e.g. already cancelled)
    }
  }

  // Record deletion so returning users can't re-use their free trial
  const trialUsed = !!user?.trialEndsAt
  const hadPaidSubscription = user?.grandfathered ||
    ['active', 'past_due', 'paused', 'canceled'].includes(user?.subscriptionStatus ?? '') &&
    !!user?.stripeSubscriptionId
  await db.insert(deletedAccounts)
    .values({ email, trialUsed, hadPaidSubscription: !!hadPaidSubscription, reason: 'self_deleted' })
    .onConflictDoUpdate({
      target: deletedAccounts.email,
      set: { deletedAt: new Date(), trialUsed, hadPaidSubscription: !!hadPaidSubscription, reason: 'self_deleted' },
    })

  // Adventures cascade-delete nodes and choices automatically
  await db.delete(adventures).where(eq(adventures.userEmail, email))
  await db.delete(users).where(eq(users.email, email))

  return NextResponse.json({ success: true })
}
