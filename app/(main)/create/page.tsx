import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { eq, sql } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { canCreateStories } from '@/lib/subscription'
import CreateStoryForm from './CreateStoryForm'

export default async function CreatePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/sign-in')

  const allowed = await canCreateStories(session.user.email)
  let isFreeTier = false

  if (!allowed) {
    // Free tier: allow if the user has no stories yet
    const [{ storyCount }] = await db
      .select({ storyCount: sql<number>`count(*)::int` })
      .from(adventures)
      .where(eq(adventures.userEmail, session.user.email))
    if ((storyCount ?? 0) >= 1) {
      redirect('/pricing?reason=free_tier_limit')
    }
    isFreeTier = true
  }

  return <CreateStoryForm isFreeTier={isFreeTier} />
}
