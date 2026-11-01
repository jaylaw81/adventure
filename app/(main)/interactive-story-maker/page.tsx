import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Image as ImageIcon, Music, BookOpen, Languages, BarChart2, Users } from 'lucide-react'
import ProductLanding from '@/components/content/ProductLanding'

const SITE_URL = 'https://www.storyquestor.com'
const PATH = '/interactive-story-maker'
const DESCRIPTION = 'Create interactive stories online where readers make the choices. Add scene images, soundscapes and RPG stats, then publish for anyone to play free.'

export const metadata: Metadata = {
  title: { absolute: 'Interactive Story Maker — Create Branching Stories Online | StoryQuestor' },
  description: DESCRIPTION,
  keywords: ['interactive story maker', 'interactive story creator', 'make an interactive story', 'interactive fiction maker', 'online story maker with choices'],
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: 'Interactive Story Maker',
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
}

const link = 'text-amber-700 underline underline-offset-2 font-medium'

export default function InteractiveStoryMakerPage() {
  return (
    <ProductLanding
      path={PATH}
      eyebrow={{ icon: Sparkles, label: 'Interactive Story Maker' }}
      title={['Interactive', 'Story Maker']}
      schemaName="Interactive Story Maker"
      subtitle="Turn your story into something readers play. Every choice leads somewhere new, with images, sound and stats to bring each scene to life."
      intro={{
        heading: 'What Makes a Story Interactive?',
        paragraphs: [
          <>An interactive story hands the reader the pen at the moments that matter. Instead of turning the page, they choose: trust the stranger or walk away, open the door or run. Each decision leads to a different scene, and different readers finish in different places.</>,
          <>StoryQuestor gives you three ways to build one. <strong>Story Path</strong> is classic branching fiction. <strong>World Builder</strong> adds RPG stats, items and combat so the story remembers what the reader has done. <strong>Storybook</strong> is a page-by-page picture book format, great for younger readers.</>,
          <>If you&apos;re still deciding what kind of story to tell, <Link href="/guide/what-is-interactive-fiction" className={link}>what is interactive fiction?</Link> covers the main forms, and <Link href="/guide/interactive-fiction-genres" className={link}>interactive fiction genres</Link> shows how branching works in horror, mystery, romance and fantasy.</>,
        ],
      }}
      features={{
        heading: 'Bring Every Scene to Life',
        items: [
          { icon: ImageIcon, title: 'Scene images', body: 'Generate an illustration for any scene, or upload your own, so readers see the world they are choosing their way through.' },
          { icon: Music, title: 'Soundscapes', body: 'Set the mood with ambient sound per scene: rain on a window, a crackling fire, a crowded tavern.' },
          { icon: Users, title: 'Characters with stats', body: 'In World Builder, track health, armor and custom attributes that change with each choice.' },
          { icon: BookOpen, title: 'Chapters', body: 'Split long stories into chapters so readers can see their progress and you can stay organized.' },
          { icon: Languages, title: 'Reader translation', body: 'Readers can translate a story into their own language as they play, so your story can reach further.' },
          { icon: BarChart2, title: 'Story analytics', body: 'See how many people read your story and where they came from, so you know what is working.' },
        ],
      }}
      faqs={[
        { q: 'What is an interactive story maker?', a: 'It is a tool for writing stories where the reader makes choices that change what happens. StoryQuestor handles the branching, the reading experience and the hosting, so you can focus on writing.' },
        { q: 'Can I make an interactive story for free?', a: 'Yes. Your first story is free to write and publish. Scene images, portraits, soundscapes and analytics are included on the Monthly and Yearly plans.' },
        { q: 'Who can read my story?', a: 'Anyone with the link, on any device, without signing up. You can also publish it to the Explore page so new readers can find it, or keep it private on a paid plan.' },
        { q: 'Can I use it with a class or group?', a: 'Yes. StoryQuestor for schools gives teachers a private space to invite students, review their work and manage consent.' },
      ]}
      related={[
        { href: '/choose-your-own-adventure-maker', title: 'Choose Your Own Adventure Maker', description: 'Step-by-step: from first scene to published adventure.', tag: 'Tool' },
        { href: '/guide/what-is-interactive-fiction', title: 'What Is Interactive Fiction?', description: 'A complete introduction to the medium and its forms.', tag: 'Guide' },
        { href: '/interactive-fiction-for-teachers', title: 'Interactive Fiction for Teachers', description: 'Using branching stories to teach writing and decision-making.', tag: 'Education' },
        { href: '/explore', title: 'Explore Stories', description: 'Play stories made by the StoryQuestor community.', tag: 'Read' },
      ]}
      cta={{ heading: 'Start your interactive story', body: 'Write it, play it, share it. Your first story is free.' }}
    />
  )
}
