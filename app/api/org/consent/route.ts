import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationMembers, organizations } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { sendConsentDeclined } from '@/lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.tier !== 'organization') {
    return Response.json({ required: false })
  }

  const [row] = await db
    .select({
      consentStatus: organizationMembers.consentStatus,
      consentFormEnabled: organizations.consentFormEnabled,
      consentFormTitle: organizations.consentFormTitle,
      consentFormBody: organizations.consentFormBody,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userEmail, session.user.email))
    .limit(1)

  if (!row) return Response.json({ required: false })
  if (!row.consentFormEnabled) return Response.json({ required: false })

  const status = row.consentStatus
  if (status === 'accepted' || status === null) return Response.json({ required: false })
  if (status === 'pending') {
    return Response.json({
      required: true,
      status: 'pending',
      title: row.consentFormTitle,
      body: row.consentFormBody,
    })
  }
  if (status === 'declined') {
    return Response.json({ required: true, status: 'declined' })
  }

  return Response.json({ required: false })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* empty */ }

  const consent = body.consent

  // Find the member's org
  const [row] = await db
    .select({
      organizationId: organizationMembers.organizationId,
      adminEmail: organizations.adminEmail,
      orgName: organizations.name,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userEmail, session.user.email))
    .limit(1)

  if (!row) return Response.json({ error: 'Not found' }, { status: 404 })

  if (consent === true) {
    await db
      .update(organizationMembers)
      .set({ consentStatus: 'accepted', consentedAt: new Date() })
      .where(and(
        eq(organizationMembers.organizationId, row.organizationId),
        eq(organizationMembers.userEmail, session.user.email),
      ))
  } else {
    await db
      .update(organizationMembers)
      .set({ consentStatus: 'declined' })
      .where(and(
        eq(organizationMembers.organizationId, row.organizationId),
        eq(organizationMembers.userEmail, session.user.email),
      ))
    sendConsentDeclined({
      to: row.adminEmail,
      orgName: row.orgName,
      memberEmail: session.user.email,
    }).catch(() => {})
  }

  return Response.json({ ok: true })
}
