import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizations } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { Organization } from '@/lib/schema'
import type { Session } from 'next-auth'

export type OrgAdminContext = { session: Session; org: Organization }

export async function getOrgAdminContext(): Promise<OrgAdminContext | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.tier !== 'organization') return null

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.adminEmail, session.user.email))
    .limit(1)

  if (!org) return null
  return { session, org }
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
