import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationInvites, organizationMembers, organizationGroups } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://www.storyquestor.com'
const INVITE_TTL_DAYS = 30

export async function GET() {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const invites = await db
    .select({
      id: organizationInvites.id,
      email: organizationInvites.email,
      token: organizationInvites.token,
      status: organizationInvites.status,
      role: organizationInvites.role,
      groupId: organizationInvites.groupId,
      groupName: organizationGroups.name,
      expiresAt: organizationInvites.expiresAt,
      createdAt: organizationInvites.createdAt,
    })
    .from(organizationInvites)
    .leftJoin(organizationGroups, eq(organizationGroups.id, organizationInvites.groupId))
    .where(eq(organizationInvites.organizationId, ctx.org.id))
    .orderBy(organizationInvites.createdAt)

  return Response.json(invites)
}

export async function POST(req: Request) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { email, groupId, role } = body as Record<string, unknown>
  const cleanEmail = typeof email === 'string'
    ? email.trim().toLowerCase().slice(0, 254)
    : null

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return Response.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const VALID_ROLES = ['member', 'teacher', 'reviewer']
  const resolvedRole = typeof role === 'string' && VALID_ROLES.includes(role) ? role : 'member'

  // Validate groupId if provided
  let resolvedGroupId: string | null = null
  if (groupId && typeof groupId === 'string') {
    const [grp] = await db
      .select({ id: organizationGroups.id })
      .from(organizationGroups)
      .where(and(eq(organizationGroups.id, groupId), eq(organizationGroups.organizationId, ctx.org.id)))
      .limit(1)
    if (!grp) return Response.json({ error: 'Group not found' }, { status: 404 })
    resolvedGroupId = grp.id
  }

  // Already a member?
  const [existingMember] = await db
    .select()
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, ctx.org.id),
      eq(organizationMembers.userEmail, cleanEmail),
    ))
    .limit(1)

  if (existingMember) {
    return Response.json({ error: 'This person is already a member.' }, { status: 409 })
  }

  // Expire any existing pending invite for this email
  await db
    .update(organizationInvites)
    .set({ status: 'expired' })
    .where(and(
      eq(organizationInvites.organizationId, ctx.org.id),
      eq(organizationInvites.email, cleanEmail),
      eq(organizationInvites.status, 'pending'),
    ))

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS)

  const [invite] = await db
    .insert(organizationInvites)
    .values({
      organizationId: ctx.org.id,
      groupId: resolvedGroupId,
      email: cleanEmail,
      token,
      role: resolvedRole,
      invitedBy: ctx.session.user.email,
      expiresAt,
    })
    .returning()

  const inviteUrl = `${SITE_URL}/org/invite/${token}`
  return Response.json({ invite, inviteUrl })
}
