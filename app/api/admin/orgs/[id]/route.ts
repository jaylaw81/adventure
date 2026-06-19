import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizations, organizationMembers, users } from '@/lib/schema'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      adminEmail: organizations.adminEmail,
      adminName: users.displayName,
      description: organizations.description,
      privacyLevel: organizations.privacyLevel,
      status: organizations.status,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .leftJoin(users, eq(users.email, organizations.adminEmail))
    .where(eq(organizations.id, id))
    .limit(1)

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const members = await db
    .select({
      id: organizationMembers.id,
      userEmail: organizationMembers.userEmail,
      displayName: users.displayName,
      role: organizationMembers.role,
      roleScope: organizationMembers.roleScope,
      status: organizationMembers.status,
      joinedAt: organizationMembers.joinedAt,
    })
    .from(organizationMembers)
    .leftJoin(users, eq(users.email, organizationMembers.userEmail))
    .where(eq(organizationMembers.organizationId, id))
    .orderBy(organizationMembers.joinedAt)

  // Mask member PII — main admin sees only the email domain, not names or full addresses
  const maskedMembers = members.map(m => ({
    id: m.id,
    userEmail: '@' + (m.userEmail.split('@')[1] ?? 'unknown'),
    displayName: null as string | null,
    role: m.role,
    roleScope: m.roleScope,
    status: m.status,
    joinedAt: m.joinedAt,
  }))

  return NextResponse.json({ ...org, members: maskedMembers })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { action } = body as Record<string, unknown>
  if (action !== 'suspend' && action !== 'unsuspend') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const [updated] = await db
    .update(organizations)
    .set({ status: action === 'suspend' ? 'suspended' : 'active', updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning({ id: organizations.id, status: organizations.status })

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}
