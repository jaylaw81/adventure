import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, eq, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizations, organizationMembers, users } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      adminEmail: organizations.adminEmail,
      adminName: users.displayName,
      description: organizations.description,
      privacyLevel: organizations.privacyLevel,
      status: organizations.status,
      createdAt: organizations.createdAt,
      memberCount: sql<number>`(
        select count(*)::int from ${organizationMembers}
        where ${organizationMembers.organizationId} = ${organizations.id}
        and ${organizationMembers.status} = 'active'
      )`.mapWith(Number),
    })
    .from(organizations)
    .leftJoin(users, eq(users.email, organizations.adminEmail))
    .orderBy(desc(organizations.createdAt))

  return NextResponse.json(rows)
}
