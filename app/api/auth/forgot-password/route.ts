import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/schema'
import { sendPasswordResetEmail } from '@/lib/email'

// Token valid for 1 hour
const EXPIRES_MS = 60 * 60 * 1000

// Minimum gap between reset requests for the same email (5 minutes)
const RATE_LIMIT_MS = 5 * 60 * 1000

// Strict RFC-compliant email: no whitespace, newlines, or other injection chars
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Reject anything that could be used for header injection or other attacks
    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Always respond with the same message — never reveal whether an account exists
    const [user] = await db
      .select({ email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, normalizedEmail))

    if (user?.passwordHash) {
      // Rate-limit: if a token was already issued for this email in the last 5 minutes, do nothing
      const rateWindow = new Date(Date.now() - RATE_LIMIT_MS)
      const [recentToken] = await db
        .select({ createdAt: passwordResetTokens.createdAt })
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.email, user.email),
            gt(passwordResetTokens.createdAt, rateWindow),
          )
        )
        .limit(1)

      if (!recentToken) {
        // Invalidate all existing tokens for this account
        await db
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.email, user.email))

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + EXPIRES_MS)

        // IMPORTANT: store and send using user.email from the DB — never the raw user input
        await db.insert(passwordResetTokens).values({ token, email: user.email, expiresAt })
        await sendPasswordResetEmail(user.email, token)
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
