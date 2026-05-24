import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { desc, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, emailBlasts } from '@/lib/schema'
import { sendEmailBlast } from '@/lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const blasts = await db
    .select()
    .from(emailBlasts)
    .orderBy(desc(emailBlasts.sentAt))

  return NextResponse.json(blasts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { subject, bodyHtml } = await req.json()
  if (!subject?.trim() || !bodyHtml?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 })
  }

  const recipients = await db
    .select({ email: users.email, displayName: users.displayName, unsubscribeToken: users.unsubscribeToken })
    .from(users)
    .where(eq(users.emailSubscribed, true))

  const sentByEmail = session.user.email ?? 'admin'

  const results = await Promise.allSettled(
    recipients.map(user =>
      sendEmailBlast({
        to: user.email,
        displayName: user.displayName || null,
        subject,
        bodyHtml,
        unsubscribeToken: user.unsubscribeToken ?? user.email,
      })
    )
  )

  const successCount = results.filter(r => r.status === 'fulfilled').length

  const [blast] = await db
    .insert(emailBlasts)
    .values({ subject, bodyHtml, sentByEmail, recipientCount: successCount })
    .returning()

  return NextResponse.json({ id: blast.id, recipientCount: successCount, total: recipients.length })
}
