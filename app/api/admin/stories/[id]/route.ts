import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'

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
    .update(adventures)
    .set({ status: action === 'suspend' ? 'suspended' : 'active' })
    .where(eq(adventures.id, id))
    .returning({ id: adventures.id, status: adventures.status })

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await db.delete(adventures).where(eq(adventures.id, id))
  return NextResponse.json({ success: true })
}
