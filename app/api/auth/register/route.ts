import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, deletedAccounts, friendInvites } from '@/lib/schema'
import { sendWelcomeEmail } from '@/lib/email'
import { getPricingConfig } from '@/lib/pricing'

export async function POST(req: Request) {
  try {
    const { email, password, displayName, inviteToken } = await req.json()

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
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in with Google.' },
          { status: 409 }
        )
      }
    }

    // Check deleted account history (for cleanup only — no trial to gate)
    const [deletedRecord] = await db
      .select()
      .from(deletedAccounts)
      .where(eq(deletedAccounts.email, normalizedEmail))

    // Validate invite token if provided
    let validInvite: { id: string; inviterEmail: string } | null = null
    if (inviteToken) {
      const [invite] = await db
        .select({ id: friendInvites.id, inviterEmail: friendInvites.inviterEmail, status: friendInvites.status })
        .from(friendInvites)
        .where(eq(friendInvites.token, inviteToken))
      if (invite && invite.status !== 'rewarded') {
        validInvite = invite
      }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const pricing = await getPricingConfig()
    const trialEndsAt = pricing.trialDays > 0
      ? new Date(Date.now() + pricing.trialDays * 24 * 60 * 60 * 1000)
      : null
    const [newUser] = await db.insert(users).values({
      email: normalizedEmail,
      displayName: displayName?.trim() || '',
      passwordHash,
      trialEndsAt,
      invitedByToken: validInvite ? inviteToken : null,
    }).returning({
      unsubscribeToken: users.unsubscribeToken,
      displayName: users.displayName,
    })

    // Clean up deleted account record
    if (deletedRecord) {
      await db.delete(deletedAccounts).where(eq(deletedAccounts.email, normalizedEmail))
    }

    // Mark invite as signed_up
    if (validInvite) {
      db.update(friendInvites)
        .set({ status: 'signed_up', signedUpAt: new Date() })
        .where(eq(friendInvites.id, validInvite.id))
        .catch(console.error)
    }

    if (newUser?.unsubscribeToken) {
      sendWelcomeEmail({
        to: normalizedEmail,
        displayName: newUser.displayName || null,
        unsubscribeToken: newUser.unsubscribeToken,
      }).catch(console.error)
    }

    return NextResponse.json({ ok: true, previousAccount: !!deletedRecord })
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
