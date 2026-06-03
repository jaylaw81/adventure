import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq } from 'drizzle-orm'
import crypto from 'crypto'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizations, organizationMembers, organizationInvites } from '@/lib/schema'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://www.storyquestor.com'
const INVITE_TTL_DAYS = 30

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1)

  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { email, role } = body as Record<string, unknown>
  const cleanEmail = typeof email === 'string'
    ? email.trim().toLowerCase().slice(0, 254)
    : null

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const VALID_ROLES = ['member', 'teacher', 'reviewer']
  const resolvedRole = typeof role === 'string' && VALID_ROLES.includes(role) ? role : 'member'

  const [existingMember] = await db
    .select()
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, id),
      eq(organizationMembers.userEmail, cleanEmail),
    ))
    .limit(1)

  if (existingMember) {
    return NextResponse.json({ error: 'This person is already a member.' }, { status: 409 })
  }

  await db
    .update(organizationInvites)
    .set({ status: 'expired' })
    .where(and(
      eq(organizationInvites.organizationId, id),
      eq(organizationInvites.email, cleanEmail),
      eq(organizationInvites.status, 'pending'),
    ))

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS)

  const [invite] = await db
    .insert(organizationInvites)
    .values({
      organizationId: id,
      email: cleanEmail,
      token,
      role: resolvedRole,
      invitedBy: session.user.email,
      expiresAt,
    })
    .returning()

  const inviteUrl = `${SITE_URL}/org/invite/${token}`
  return NextResponse.json({ invite, inviteUrl })
}
