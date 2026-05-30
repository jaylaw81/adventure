import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'

export async function POST(req: Request) {
  try {
    const { email, password, displayName } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if email is already registered
    const [existing] = await db.select({ email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, normalizedEmail))

    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      } else {
        // Google-only account — block sign-up to prevent account takeover.
        // Anyone can call this endpoint; we must not let them add a password to
        // a Google account they don't own.
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in with Google.' },
          { status: 409 }
        )
      }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await db.insert(users).values({
      email: normalizedEmail,
      displayName: displayName?.trim() || '',
      passwordHash,
      trialEndsAt,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
