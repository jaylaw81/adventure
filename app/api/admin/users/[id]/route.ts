import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json()

  if (action !== 'suspend' && action !== 'unsuspend') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const [updated] = await db
    .update(users)
    .set({ status: action === 'suspend' ? 'suspended' : 'active' })
    .where(eq(users.id, id))
    .returning({ id: users.id, email: users.email, status: users.status })

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'suspend' && updated.email === session.user.email) {
    return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, id))
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (target.email === session.user.email) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  await db.delete(users).where(eq(users.id, id))
  return NextResponse.json({ success: true })
}
