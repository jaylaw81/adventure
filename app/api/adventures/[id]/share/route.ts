import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, and } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, organizationMembers, organizations } from '@/lib/schema'
import { canHavePrivateStories } from '@/lib/subscription'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params

    // Verify ownership
    const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
    if (!adventure || adventure.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Block publishing if the user's org restricts it
    const [membership] = await db
      .select({ orgPrivacyLevel: organizations.privacyLevel })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
      .where(and(
        eq(organizationMembers.userEmail, session.user.email),
        eq(organizationMembers.status, 'active'),
      ))
      .limit(1)

    if (membership && membership.orgPrivacyLevel !== 'public') {
      return NextResponse.json(
        { error: 'Your organization does not allow publishing stories publicly.' },
        { status: 403 }
      )
    }

    // Generate a token if one doesn't already exist, then make public.
    // If the story was a draft, this publish action activates it.
    const token = adventure.shareToken ?? crypto.randomUUID().replace(/-/g, '')
    const updateSet: Partial<typeof adventures.$inferInsert> = { isPublic: true, shareToken: token }
    if (adventure.status === 'draft') updateSet.status = 'active'
    const [updated] = await db
      .update(adventures)
      .set(updateSet)
      .where(eq(adventures.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to enable sharing' }, { status: 500 })
  }
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params

    const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
    if (!adventure || adventure.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const [updated] = await db
      .update(adventures)
      .set({ status: 'draft', isPublic: false })
      .where(eq(adventures.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to move to draft' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params

    const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
    if (!adventure || adventure.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Private stories are a paid-subscriber benefit — trial users cannot un-publish
    if (!await canHavePrivateStories(session.user.email)) {
      return NextResponse.json(
        { error: 'Private stories are a subscriber benefit.', code: 'subscription_required' },
        { status: 402 }
      )
    }

    const [updated] = await db
      .update(adventures)
      .set({ isPublic: false })
      .where(eq(adventures.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to disable sharing' }, { status: 500 })
  }
}
