import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationMembers, organizations, users } from '@/lib/schema'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; email: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, email } = await params
  const decodedEmail = decodeURIComponent(email)

  await db
    .delete(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, id),
      eq(organizationMembers.userEmail, decodedEmail),
    ))

  // Revert tier to 'free' if the user has no remaining org memberships and is not an org admin
  const [remainingMembership] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.userEmail, decodedEmail))
    .limit(1)

  const [isOrgAdmin] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.adminEmail, decodedEmail))
    .limit(1)

  if (!remainingMembership && !isOrgAdmin) {
    await db.update(users).set({ tier: 'free' }).where(eq(users.email, decodedEmail))
  }

  return NextResponse.json({ success: true })
}
