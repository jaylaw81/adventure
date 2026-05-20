import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { sendAdminMessage } from '@/lib/email'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { subject, message } = await req.json()

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
  }

  const [user] = await db
    .select({ email: users.email, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, id))

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sendAdminMessage({
    to: user.email,
    displayName: user.displayName || null,
    subject: subject.trim(),
    message: message.trim(),
  })

  return NextResponse.json({ success: true })
}
