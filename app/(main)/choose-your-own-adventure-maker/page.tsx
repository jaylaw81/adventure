import type { Metadata } from 'next'
import Link from 'next/link'
import { Wand2, GitBranch, LayoutList, Flag, Globe, Star, Sword } from 'lucide-react'
import ProductLanding from '@/components/content/ProductLanding'

const SITE_URL = 'https://www.storyquestor.com'
const PATH = '/choose-your-own-adventure-maker'
const DESCRIPTION = 'Make your own choose your own adventure story online for free. Map every choice on a visual canvas, write each scene, and share a link anyone can play.'

export const metadata: Metadata = {
  title: { absolute: 'Choose Your Own Adventure Maker — Free & Online | StoryQuestor' },
  description: DESCRIPTION,
  keywords: ['choose your own adventure maker', 'choose your own adventure creator', 'make a choose your own adventure story', 'cyoa maker', 'cyoa creator online'],
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: 'Choose Your Own Adventure Maker',
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
}

const link = 'text-amber-700 underline underline-offset-2 font-medium'

export default function ChooseYourOwnAdventureMakerPage() {
  return (
    <ProductLanding
      path={PATH}
      eyebrow={{ icon: Wand2, label: 'CYOA Maker' }}
      title={['Choose Your Own', 'Adventure Maker']}
      schemaName="Choose Your Own Adventure Maker"
      subtitle="Write a story where the reader decides what happens next. Plan every branch on a visual canvas, then share a link anyone can play for free. No code needed."
      intro={{
        heading: 'Make a Choose Your Own Adventure Story Without the Spreadsheet',
        paragraphs: [
          <>If you&apos;ve ever tried to write a choose your own adventure story in a word processor, you know the problem: by the third decision you&apos;re juggling &ldquo;turn to page 47&rdquo; notes and losing track of which paths lead where. StoryQuestor replaces that with a map. Every scene is a card, every choice is an arrow, and you can see the whole story at once.</>,
          <>When you&apos;re done, readers play it in the browser, one scene at a time, picking choices that take them down different paths to different endings. You don&apos;t need to install anything, learn a scripting language, or host a website.</>,
          <>New to branching fiction? Our guide on <Link href="/guide/how-to-write-branching-stories" className={link}>how to write branching stories</Link> walks through planning your first one, and <Link href="/guide/how-to-write-multiple-endings" className={link}>how to write multiple endings</Link> covers making every ending feel earned.</>,
        ],
      }}
      steps={{
        heading: 'How to Make Your Own Choose Your Own Adventure',
        items: [
          { title: 'Pick a starting point', body: 'Start from a blank story or a ready-made structure (small with two endings, medium with four, or large with six) so you begin with the branches already laid out.' },
          { title: 'Write your opening scene', body: 'Set up the situation and the first decision. Good openings put the reader in a spot where both options are tempting.' },
          { title: 'Add choices and branch', body: 'Each choice links to a new scene. Drag scenes around the canvas to keep the story map readable as it grows.' },
          { title: 'Write your endings', body: 'Mark scenes as endings. StoryQuestor counts how many endings readers can actually reach from the start, so you know every path leads somewhere.' },
          { title: 'Publish and share', body: 'Make the story public to list it on Explore, or share the link directly. Reading is always free, with no account needed.' },
        ],
      }}
      features={{
        heading: 'Everything You Need to Build a CYOA Story',
        items: [
          { icon: GitBranch, title: 'Visual node canvas', body: 'See every scene and choice as a map. Spot loose ends and tangled paths at a glance.' },
          { icon: LayoutList, title: 'Block Builder for linear writers', body: 'Prefer writing top to bottom? The Block Builder lets you draft scene by scene and add branches as you go.' },
          { icon: Flag, title: 'Multiple endings', body: 'Write triumphant, bittersweet and secret endings, and see how many are reachable.' },
          { icon: Sword, title: 'World Builder RPG mode', body: 'Add character stats, items and foe combat so choices can depend on what the reader has done.' },
          { icon: Globe, title: 'Free to read, easy to share', body: 'Readers play in any browser on any device. Share a link or publish to Explore.' },
          { icon: Star, title: 'Ratings and reviews', body: 'Readers can rate your story and leave a review when they reach an ending.' },
        ],
      }}
      faqs={[
        { q: 'Is the choose your own adventure maker free?', a: 'Yes. You can write and publish your first story for free with the Block Builder. Paid plans add unlimited stories, the visual canvas, World Builder, private stories and more.' },
        { q: 'Do I need to know how to code?', a: 'No. You write scenes and connect choices with the mouse. There is no scripting or markup to learn.' },
        { q: 'Can readers play on their phones?', a: 'Yes. Stories play in any modern browser, on desktop or mobile, without an app or an account.' },
        { q: 'How long should a choose your own adventure story be?', a: 'Many good first stories have 15 to 30 scenes and three to five endings. That is enough for choices to matter without becoming unmanageable to write.' },
        { q: 'Can I export my story?', a: 'Yes. Paid plans can export any story as a Twine 2 file to open in Twine.' },
      ]}
      related={[
        { href: '/guide/how-to-write-branching-stories', title: 'How to Write Branching Stories', description: 'A step-by-step approach to planning and drafting your first branching story.', tag: 'Guide' },
        { href: '/branching-story-planner', title: 'Branching Story Planner', description: 'Map out a branching plot before you write a single scene.', tag: 'Tool' },
        { href: '/guide/how-to-create-meaningful-choices', title: 'How to Create Meaningful Choices', description: 'What makes a choice feel weighty instead of fake.', tag: 'Guide' },
        { href: '/resources/choose-your-own-adventure-history', title: 'Choose Your Own Adventure History', description: 'Where the format came from, from 1979 to today.', tag: 'Resources' },
      ]}
      cta={{ heading: 'Make your first adventure today', body: 'Your first story is free. Start with a ready-made structure and have something playable in an afternoon.' }}
    />
  )
}
