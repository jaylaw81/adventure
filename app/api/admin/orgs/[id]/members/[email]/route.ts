import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationMembers } from '@/lib/schema'

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

  return NextResponse.json({ success: true })
}
