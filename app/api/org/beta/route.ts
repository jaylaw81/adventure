import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationWaitlist, organizations, organizationMembers, users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// GET /api/org/beta?token=... — validate a beta invite token (public, no auth required)
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return Response.json({ error: 'Token is required' }, { status: 400 })

  const [entry] = await db
    .select({
      id: organizationWaitlist.id,
      email: organizationWaitlist.email,
      name: organizationWaitlist.name,
      school: organizationWaitlist.school,
      status: organizationWaitlist.status,
      inviteExpiresAt: organizationWaitlist.inviteExpiresAt,
    })
    .from(organizationWaitlist)
    .where(eq(organizationWaitlist.inviteToken, token))
    .limit(1)

  if (!entry) return Response.json({ error: 'Invalid invite token' }, { status: 404 })
  if (entry.status !== 'accepted') return Response.json({ error: 'This invite is no longer valid' }, { status: 410 })
  if (!entry.inviteExpiresAt || entry.inviteExpiresAt < new Date()) {
    return Response.json({ error: 'This invite has expired' }, { status: 410 })
  }

  return Response.json({ email: entry.email, name: entry.name, school: entry.school })
}

// POST /api/org/beta — redeem a token and create the org (requires auth)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'You must be signed in to complete setup' }, { status: 401 })
  }

  const body = await req.json()
  const { token, orgName } = body as { token?: string; orgName?: string }

  if (!token || !orgName?.trim()) {
    return Response.json({ error: 'Token and organization name are required' }, { status: 400 })
  }

  const [entry] = await db
    .select()
    .from(organizationWaitlist)
    .where(eq(organizationWaitlist.inviteToken, token))
    .limit(1)

  if (!entry) return Response.json({ error: 'Invalid invite token' }, { status: 404 })
  if (entry.status !== 'accepted') return Response.json({ error: 'This invite is no longer valid' }, { status: 410 })
  if (!entry.inviteExpiresAt || entry.inviteExpiresAt < new Date()) {
    return Response.json({ error: 'This invite has expired' }, { status: 410 })
  }
  if (entry.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return Response.json({ error: 'This invite was issued for a different email address' }, { status: 403 })
  }

  // Check they don't already have an org
  const [existingOrg] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.adminEmail, session.user.email))
    .limit(1)

  if (existingOrg) {
    return Response.json({ error: 'You already have an organization' }, { status: 409 })
  }

  // Create org, upgrade tier, add as admin member — consume the token by expiring it
  const [org] = await db
    .insert(organizations)
    .values({
      name: orgName.trim(),
      adminEmail: session.user.email,
      description: entry.school ? `${entry.school}` : null,
    })
    .returning()

  await Promise.all([
    db.insert(organizationMembers).values({
      organizationId: org.id,
      userEmail: session.user.email,
      role: 'admin',
    }),
    db.update(users)
      .set({ tier: 'organization' })
      .where(eq(users.email, session.user.email)),
    // Consume the token so it can't be reused
    db.update(organizationWaitlist)
      .set({ inviteExpiresAt: new Date(0), status: 'accepted' })
      .where(eq(organizationWaitlist.id, entry.id)),
  ])

  return Response.json({ ok: true, orgId: org.id })
}
