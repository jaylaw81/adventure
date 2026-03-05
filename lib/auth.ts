import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { isAdult } from '@/lib/age'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        await db
          .insert(users)
          .values({ email: user.email, displayName: user.name ?? '' })
          .onConflictDoNothing()
      } catch {
        // Non-fatal
      }
      return true
    },
    async jwt({ token, trigger, session }) {
      // Handle update() calls from client (e.g. after saving profile)
      if (trigger === 'update') {
        if (session?.displayName !== undefined) token.displayName = session.displayName
        if (session?.birthDate !== undefined) {
          token.birthDate = session.birthDate
          token.isAdult = isAdult(session.birthDate)
        }
      }
      // On first JWT creation or when missing, fetch from DB
      if ((!token.displayName || token.birthDate === undefined) && token.email) {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, token.email as string))
          if (user) {
            if (!token.displayName) token.displayName = user.displayName || token.name || ''
            token.birthDate = user.birthDate ?? undefined
            token.isAdult = isAdult(user.birthDate)
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
      }
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
  },
}
