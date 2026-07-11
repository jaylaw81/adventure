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
    images: [{ url: 'https://www.storyquestor.com/storyquestor-fb.png', width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
