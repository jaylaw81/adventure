import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { getAdventure } from '@/lib/queries'
import StoryLanding, { storyLandingMetadata } from '@/components/reader/StoryLanding'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return storyLandingMetadata((await params).id)
}

export default async function StoryLandingPage({ params }: Props) {
  const { id } = await params
  // Public stories live at their readable /story/[slug] URL; this one stays as the fallback
  const adventure = await getAdventure(id)
  if (adventure?.isPublic && adventure.status === 'active' && adventure.storySlug) {
    permanentRedirect(`/story/${adventure.storySlug}`)
  }
  return <StoryLanding id={id} />
}
