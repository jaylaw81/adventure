import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationInvites, organizationMembers, organizations, memberGroups, users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { sendConsentDeclined } from '@/lib/email'

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return Response.json({ error: 'Sign in to accept this invitation' }, { status: 401 })

  const { token } = await params

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* body is optional */ }

  const [invite] = await db
    .select()
    .from(organizationInvites)
    .where(and(eq(organizationInvites.token, token), eq(organizationInvites.status, 'pending')))
    .limit(1)

  if (!invite) return Response.json({ error: 'Invitation not found or already used' }, { status: 404 })
  if (invite.expiresAt < new Date()) {
    await db.update(organizationInvites).set({ status: 'expired' }).where(eq(organizationInvites.id, invite.id))
    return Response.json({ error: 'This invitation has expired' }, { status: 410 })
  }

  // Fetch org consent settings
  const [org] = await db
    .select({
      consentFormEnabled: organizations.consentFormEnabled,
      adminEmail: organizations.adminEmail,
      name: organizations.name,
    })
    .from(organizations)
    .where(eq(organizations.id, invite.organizationId))
    .limit(1)

  if (org?.consentFormEnabled) {
    const consent = body.consent
    if (consent === false) {
      // Member declined — do NOT insert them. Notify admin.
      sendConsentDeclined({
        to: org.adminEmail,
        orgName: org.name,
        memberEmail: session.user.email,
      }).catch(() => {})
      return Response.json({ declined: true })
    }
    // consent === true: insert with consent fields
    await db
      .insert(organizationMembers)
      .values({
        organizationId: invite.organizationId,
        userEmail: session.user.email,
        role: invite.role ?? 'member',
        consentStatus: 'accepted',
        consentedAt: new Date(),
      })
      .onConflictDoNothing()
  } else {
    // No consent form: insert normally
    await db
      .insert(organizationMembers)
      .values({
        organizationId: invite.organizationId,
        userEmail: session.user.email,
        role: invite.role ?? 'member',
      })
      .onConflictDoNothing()
  }

  // Elevate the user's tier so they get org-level access immediately
  await db
    .update(users)
    .set({ tier: 'organization' })
    .where(eq(users.email, session.user.email))

  // Assign to the invited group (if any) in the join table
  if (invite.groupId) {
    await db
      .insert(memberGroups)
      .values({
        organizationId: invite.organizationId,
        userEmail: session.user.email,
        groupId: invite.groupId,
      })
      .onConflictDoNothing()
  }

  await db.update(organizationInvites).set({ status: 'accepted' }).where(eq(organizationInvites.id, invite.id))

  return Response.json({ ok: true })
}

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [row] = await db
    .select({
      id: organizationInvites.id,
      email: organizationInvites.email,
      status: organizationInvites.status,
      expiresAt: organizationInvites.expiresAt,
      organizationId: organizationInvites.organizationId,
      groupId: organizationInvites.groupId,
      orgName: organizations.name,
      adminEmail: organizations.adminEmail,
      consentFormEnabled: organizations.consentFormEnabled,
      consentFormTitle: organizations.consentFormTitle,
      consentFormBody: organizations.consentFormBody,
    })
    .from(organizationInvites)
    .innerJoin(organizations, eq(organizations.id, organizationInvites.organizationId))
    .where(eq(organizationInvites.token, token))
    .limit(1)

  if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
  if (row.status !== 'pending') return Response.json({ error: 'This invitation has already been used or revoked' }, { status: 410 })
  if (row.expiresAt < new Date()) return Response.json({ error: 'This invitation has expired' }, { status: 410 })
  return Response.json(row)
}
