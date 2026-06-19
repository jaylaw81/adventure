import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationMembers, organizations, users } from '@/lib/schema'

// The route segment is named [email] for historical reasons but the param is now a member ID (UUID).
// This avoids exposing member emails through the URL since PII is masked from the main admin.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; email: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, email: memberId } = await params

  // Fetch the member's real email before deleting so we can clean up their tier afterwards
  const [member] = await db
    .select({ userEmail: organizationMembers.userEmail })
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, id),
      eq(organizationMembers.id, memberId),
    ))
    .limit(1)

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  await db
    .delete(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, id),
      eq(organizationMembers.id, memberId),
    ))

  const { userEmail } = member

  // Revert tier to 'free' if the user has no remaining org memberships and is not an org admin
  const [remainingMembership] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.userEmail, userEmail))
    .limit(1)

  const [isOrgAdmin] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.adminEmail, userEmail))
    .limit(1)

  if (!remainingMembership && !isOrgAdmin) {
    await db.update(users).set({ tier: 'free' }).where(eq(users.email, userEmail))
  }

  return NextResponse.json({ success: true })
}
