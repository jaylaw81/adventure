import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/schema'
import { sendPasswordResetEmail } from '@/lib/email'

// Token valid for 1 hour
const EXPIRES_MS = 60 * 60 * 1000

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Always respond with success to avoid leaking whether an account exists
    const [user] = await db
      .select({ email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, normalizedEmail))

    if (user?.passwordHash) {
      // Invalidate any existing unused tokens for this email
      await db
        .delete(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.email, normalizedEmail),
            gt(passwordResetTokens.expiresAt, new Date()),
          )
        )

      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + EXPIRES_MS)

      await db.insert(passwordResetTokens).values({ token, email: normalizedEmail, expiresAt })

      await sendPasswordResetEmail(normalizedEmail, token)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
