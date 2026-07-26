import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      isAdult: boolean
      profileComplete: boolean
      isAdmin: boolean
      tier: string
      subscriptionStatus: string | null
      subscriptionInterval: string | null
      languagePreference: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    displayName?: string
    birthDate?: string
    isAdult?: boolean
    isAdmin?: boolean
    tier?: string
    subscriptionStatus?: string | null
    subscriptionInterval?: string | null
  }
}
