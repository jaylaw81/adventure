import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { and, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, emailBlasts, emailBlastRecipients } from '@/lib/schema'
import { sendEmailBlast } from '@/lib/email'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ blastId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteUrl = process.env.NEXTAUTH_URL ?? ''
  if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Email blasts are disabled on localhost' }, { status: 403 })
  }

  const { blastId } = await params

  const [original] = await db.select().from(emailBlasts).where(eq(emailBlasts.id, blastId))
  if (!original) {
    return NextResponse.json({ error: 'Blast not found' }, { status: 404 })
  }

  // Find recipients that failed in the original blast
  const failedRecipients = await db
    .select({ email: emailBlastRecipients.email })
    .from(emailBlastRecipients)
    .where(and(eq(emailBlastRecipients.blastId, blastId), eq(emailBlastRecipients.status, 'failed')))

  if (failedRecipients.length === 0) {
    return NextResponse.json({ error: 'No failed recipients to resend to' }, { status: 400 })
  }

  // Look up user details for unsubscribe tokens — only resend to still-subscribed users
  const emails = failedRecipients.map(r => r.email)
  const recipientDetails = await db
    .select({ email: users.email, displayName: users.displayName, unsubscribeToken: users.unsubscribeToken })
    .from(users)
    .where(eq(users.emailSubscribed, true))
    .then(all => all.filter(u => emails.includes(u.email)))

  if (recipientDetails.length === 0) {
    return NextResponse.json({ error: 'No subscribed failed recipients found' }, { status: 400 })
  }

  const sentByEmail = session.user.email ?? 'admin'
  const subject = `[Resend] ${original.subject}`

  const [newBlast] = await db
    .insert(emailBlasts)
    .values({ subject, bodyHtml: original.bodyHtml, sentByEmail, recipientCount: 0 })
    .returning()

  const BATCH_SIZE = 4
  const BATCH_DELAY_MS = 1100

  const recipientRows: {
    blastId: string
    email: string
    resendId: string | null
    status: string
    error: string | null
  }[] = []

  for (let i = 0; i < recipientDetails.length; i += BATCH_SIZE) {
    const batch = recipientDetails.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(u =>
        sendEmailBlast({
          to: u.email,
          displayName: u.displayName || null,
          subject: original.subject,
          bodyHtml: original.bodyHtml,
          unsubscribeToken: u.unsubscribeToken ?? u.email,
        })
      )
    )

    for (let j = 0; j < batch.length; j++) {
      const r = results[j]
      recipientRows.push({
        blastId: newBlast.id,
        email: batch[j].email,
        resendId: r.status === 'fulfilled' ? r.value : null,
        status: r.status === 'fulfilled' ? 'sent' : 'failed',
        error: r.status === 'rejected' ? String(r.reason) : null,
      })
    }

    if (i + BATCH_SIZE < recipientDetails.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  const successCount = recipientRows.filter(r => r.status === 'sent').length

  if (recipientRows.length > 0) {
    await db.insert(emailBlastRecipients).values(recipientRows)
  }

  await db.update(emailBlasts)
    .set({ recipientCount: successCount })
    .where(eq(emailBlasts.id, newBlast.id))

  return NextResponse.json({ id: newBlast.id, recipientCount: successCount, total: recipientDetails.length })
}
