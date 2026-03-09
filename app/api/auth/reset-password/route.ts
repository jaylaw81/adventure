import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq, and, gt, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/schema'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Look up the token — must exist, not expired, and not already used
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt),
        )
      )
      .limit(1)

    if (!record) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Update password and mark token as used in parallel
    await Promise.all([
      db.update(users).set({ passwordHash }).where(eq(users.email, record.email)),
      db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.token, token)),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
