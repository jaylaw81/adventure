import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adminMessages } from '@/lib/schema'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const messages = await db
    .select()
    .from(adminMessages)
    .where(eq(adminMessages.userId, id))
    .orderBy(desc(adminMessages.sentAt))

  return NextResponse.json(messages)
}
