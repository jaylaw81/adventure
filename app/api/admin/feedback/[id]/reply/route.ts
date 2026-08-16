import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, desc } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteFeedback, feedbackReplies, users } from '@/lib/schema'
import { sendAdminMessage } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

export async function GET(_req: Request, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const replies = await db
    .select()
    .from(feedbackReplies)
    .where(eq(feedbackReplies.feedbackId, id))
    .orderBy(desc(feedbackReplies.sentAt))

  return NextResponse.json(replies)
}

export async function POST(req: Request, { params }: Params) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { subject, message } = await req.json()

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
  }

  const [feedback] = await db.select().from(siteFeedback).where(eq(siteFeedback.id, id))
  if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!feedback.userEmail) {
    return NextResponse.json({ error: 'This feedback was submitted anonymously — there is no email to reply to.' }, { status: 400 })
  }

  const [user] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.email, feedback.userEmail))

  await sendAdminMessage({
    to: feedback.userEmail,
    displayName: user?.displayName || null,
    subject: subject.trim(),
    message: message.trim(),
  })

  const [saved] = await db
    .insert(feedbackReplies)
    .values({
      feedbackId: id,
      sentByEmail: session.user.email!,
      subject: subject.trim(),
      message: message.trim(),
    })
    .returning()

  return NextResponse.json(saved)
}
