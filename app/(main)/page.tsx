import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LandingPage from '@/components/home/LandingPage'
import Dashboard from '@/components/home/Dashboard'

const SITE_URL = 'https://www.storyquestor.com'

export const metadata: Metadata = {
  description: 'Create free choose-your-own-adventure stories on a visual canvas. Build branching tales and RPG worlds where every choice leads somewhere new.',
  alternates: { canonical: SITE_URL },
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  return session?.user ? <Dashboard /> : <LandingPage />
}
