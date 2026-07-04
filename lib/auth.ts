import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, organizationMembers, deletedAccounts } from '@/lib/schema'
import { isAdult } from '@/lib/age'
import { sendWelcomeEmail } from '@/lib/email'

async function resolveEffectiveTier(email: string, storedTier: string): Promise<string> {
  if (storedTier !== 'free') return storedTier
  const [membership] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.userEmail, email),
      eq(organizationMembers.status, 'active'),
    ))
    .limit(1)
  if (!membership) return storedTier
  // Repair the stored tier so future logins skip this check
  await db.update(users).set({ tier: 'organization' }).where(eq(users.email, email))
  return 'organization'
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jaylaw81@gmail.com'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          // Admin login — username is "admin", not an email address
          const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'
          const adminPassword = process.env.ADMIN_PASSWORD
          if (adminPassword && credentials.email === adminUsername) {
            // Timing-safe comparison via SHA-256 so both buffers are always 32 bytes
            const h1 = crypto.createHash('sha256').update(credentials.password).digest()
            const h2 = crypto.createHash('sha256').update(adminPassword).digest()
            if (!crypto.timingSafeEqual(h1, h2)) return null
            return { id: ADMIN_EMAIL, email: ADMIN_EMAIL, name: 'Admin' }
          }

          // Regular user login
          const [user] = await db.select().from(users).where(eq(users.email, credentials.email.toLowerCase()))
          if (!user?.passwordHash) return null // no account or Google-only account
          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null
          return { id: user.email, email: user.email, name: user.displayName || user.email }
        } catch {
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        const [existing] = await db.select({ status: users.status }).from(users).where(eq(users.email, user.email))
        if (existing?.status === 'suspended') return false
        if (!existing) {
          // New Google sign-up — no trial, subscription required
          const [deletedRecord] = await db
            .select()
            .from(deletedAccounts)
            .where(eq(deletedAccounts.email, user.email))
          const [newUser] = await db.insert(users).values({
            email: user.email,
            displayName: user.name ?? '',
            trialEndsAt: null,
          }).returning({
            unsubscribeToken: users.unsubscribeToken,
            displayName: users.displayName,
          })
          if (deletedRecord) {
            await db.delete(deletedAccounts).where(eq(deletedAccounts.email, user.email))
          }
          if (newUser?.unsubscribeToken) {
            sendWelcomeEmail({
              to: user.email,
              displayName: newUser.displayName || null,
              unsubscribeToken: newUser.unsubscribeToken,
            }).catch(console.error)
          }
        } else {
          // Returning user — record last login time
          db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.email, user.email)).catch(console.error)
        }
      } catch {
        // Non-fatal
      }
      return true
    },
    async jwt({ token, trigger, session, account }) {
      // Set isAdmin once on sign-in (account is only present at sign-in time)
      if (account !== undefined) {
        token.isAdmin = token.email === ADMIN_EMAIL
      }
      // Handle update() calls from client (e.g. after saving profile)
      if (trigger === 'update') {
        if (session?.displayName !== undefined) token.displayName = session.displayName
        // Re-fetch age/tier from DB — never trust client-supplied birthDate
        if (token.email) {
          try {
            const [user] = await db.select().from(users).where(eq(users.email, token.email as string))
            if (user) {
              token.birthDate = user.birthDate ?? undefined
              token.isAdult = isAdult(user.birthDate)
              token.tier = await resolveEffectiveTier(token.email as string, user.tier)
            }
          } catch {}
        }
      }
      // On first JWT creation or when missing, fetch from DB
      if ((!token.displayName || !token.birthDate || token.tier === undefined) && token.email) {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, token.email as string))
          if (user) {
            if (!token.displayName) token.displayName = user.displayName || token.name || ''
            token.birthDate = user.birthDate ?? undefined
            token.isAdult = isAdult(user.birthDate)
            token.tier = await resolveEffectiveTier(token.email as string, user.tier)
          }
        } catch {
          token.displayName = token.displayName || token.name || ''
          token.isAdult = false
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
        session.user.name = (token.displayName as string) || (token.name as string) || session.user.email
        session.user.isAdult = token.isAdult ?? false
        session.user.profileComplete = !!token.birthDate
        session.user.isAdmin = token.isAdmin ?? false
        session.user.tier = token.tier ?? 'free'
      }
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
  },
}
