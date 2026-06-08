import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Stories',
  description: 'Browse free choose-your-own-adventure stories created by the StoryQuestor community. Every story branches — your choices shape the ending.',
  alternates: {
    canonical: 'https://www.storyquestor.com/explore',
  },
  openGraph: {
    title: 'Explore Stories — StoryQuestor',
    description: 'Browse free choose-your-own-adventure stories created by the StoryQuestor community. Every story branches — your choices shape the ending.',
    url: 'https://www.storyquestor.com/explore',
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
