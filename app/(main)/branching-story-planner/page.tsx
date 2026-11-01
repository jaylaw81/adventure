import type { Metadata } from 'next'
import Link from 'next/link'
import { Network, Map, Layers, Flag, Move, BookOpen, AlertTriangle } from 'lucide-react'
import ProductLanding from '@/components/content/ProductLanding'

const SITE_URL = 'https://www.storyquestor.com'
const PATH = '/branching-story-planner'
const DESCRIPTION = 'Plan a branching story on a visual map. Lay out every choice, path and ending before you write, spot dead ends early, and turn the plan straight into a playable story.'

export const metadata: Metadata = {
  title: { absolute: 'Branching Story Planner — Map Your Plot Visually | StoryQuestor' },
  description: DESCRIPTION,
  keywords: ['branching story planner', 'branching narrative tool', 'story branching map', 'plan a choose your own adventure', 'branching plot outline'],
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: 'Branching Story Planner',
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
}

const link = 'text-amber-700 underline underline-offset-2 font-medium'

export default function BranchingStoryPlannerPage() {
  return (
    <ProductLanding
      path={PATH}
      eyebrow={{ icon: Network, label: 'Story Planner' }}
      title={['Branching Story', 'Planner']}
      schemaName="Branching Story Planner"
      subtitle="Outline every path before you write a word. See your whole plot as a map, then fill in scenes when the structure feels right."
      intro={{
        heading: 'Why Branching Stories Need a Map',
        paragraphs: [
          <>A linear story can be outlined as a list. A branching story can&apos;t: two choices per scene doubles your scene count every level, and without a plan most writers run out of steam by the second chapter. The fix is to plan the shape of the story first, deciding where paths split, where they rejoin and where they end, before drafting any prose.</>,
          <>StoryQuestor&apos;s canvas is that plan. Add scenes as placeholders with just a title, connect them with choices, and rearrange until the structure works. When you&apos;re ready, open each scene and write it. The plan <em>is</em> the story, so nothing needs to be copied over.</>,
          <>Not sure what shape to use? <Link href="/guide/branching-story-structure" className={link}>Branching story structure explained</Link> covers the common patterns (diamonds, hubs, gauntlets and time loops) and when each one works.</>,
        ],
      }}
      steps={{
        heading: 'Plan a Branching Story in Four Passes',
        items: [
          { title: 'Spine', body: 'Sketch the main path from opening to your strongest ending as a line of scene titles.' },
          { title: 'Branches', body: 'At three or four key moments, add a real alternative. Decide where each branch goes before writing it.' },
          { title: 'Convergence', body: 'Bring some branches back together so the scene count stays manageable, and keep only the branches that earn their own ending.' },
          { title: 'Endings', body: 'Mark your endings and check the reachable ending count. Then start writing scenes, spine first.' },
        ],
      }}
      features={{
        heading: 'Planning Tools That Become Your Story',
        items: [
          { icon: Map, title: 'Whole-story map', body: 'Every scene and choice on one zoomable canvas, so you never lose your place.' },
          { icon: Move, title: 'Drag to restructure', body: 'Move scenes and rewire choices freely while the plan is still taking shape.' },
          { icon: Layers, title: 'Chapters', body: 'Group long stories into chapters and plan each one separately.' },
          { icon: Flag, title: 'Reachable ending count', body: 'See how many endings readers can actually reach from the start.' },
          { icon: AlertTriangle, title: 'Spot dead ends', body: 'Every choice is drawn as an arrow, so a scene with no way forward is easy to see on the map before readers find it.' },
          { icon: BookOpen, title: 'Starter structures', body: 'Begin from a small, medium or large ready-made structure instead of a blank page.' },
        ],
      }}
      faqs={[
        { q: 'Can I use it just for planning?', a: 'Yes. Many writers outline with scene titles and short notes first. When you are ready, the same map becomes the playable story.' },
        { q: 'How many branches should my story have?', a: 'Fewer than you think. Three or four meaningful decision points with some paths rejoining usually beat a story that branches on every scene.' },
        { q: 'Can I export my plan?', a: 'Paid plans can export a story to Twine 2, keeping your map layout, scenes and choices.' },
        { q: 'Is the planner free?', a: 'Your first story is free. The full visual canvas and unlimited stories are part of the paid plans.' },
      ]}
      related={[
        { href: '/guide/branching-story-structure', title: 'Branching Story Structure Explained', description: 'The structural patterns almost every branching story uses.', tag: 'Guide' },
        { href: '/guide/how-to-write-branching-stories', title: 'How to Write Branching Stories', description: 'From plan to finished draft.', tag: 'Guide' },
        { href: '/guide/how-to-write-multiple-endings', title: 'How to Write Multiple Endings', description: 'Make every ending feel earned.', tag: 'Guide' },
        { href: '/choose-your-own-adventure-maker', title: 'Choose Your Own Adventure Maker', description: 'Turn your plan into a playable adventure.', tag: 'Tool' },
      ]}
      cta={{ heading: 'Map your next story', body: 'Start from a ready-made structure and shape it into your own.' }}
    />
  )
}
