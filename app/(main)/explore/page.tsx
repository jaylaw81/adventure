import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getExploreStories } from '@/lib/exploreData'
import ExploreClient from './ExploreClient'

export default async function ExplorePage() {
  const [stories, session] = await Promise.all([
    getExploreStories(),
    getServerSession(authOptions),
  ])

  return (
    <ExploreClient
      initialStories={stories}
      isAdult={session?.user?.isAdult ?? false}
      isSignedIn={!!session}
    />
  )
}
