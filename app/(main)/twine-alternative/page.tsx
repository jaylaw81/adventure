import type { Metadata } from 'next'
import Link from 'next/link'
import { Shuffle, MousePointerClick, Globe, Sword, Image as ImageIcon, Download, Star } from 'lucide-react'
import ProductLanding from '@/components/content/ProductLanding'

const SITE_URL = 'https://www.storyquestor.com'
const PATH = '/twine-alternative'
const DESCRIPTION = 'Looking for a Twine alternative? StoryQuestor is a visual branching story editor with built-in hosting, RPG stats and no code — and it exports to Twine.'

export const metadata: Metadata = {
  title: { absolute: 'Twine Alternative — Visual, No-Code & Hosted | StoryQuestor' },
  description: DESCRIPTION,
  keywords: ['twine alternative', 'alternative to twine', 'twine vs', 'interactive fiction software', 'twine without code'],
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: 'A Twine Alternative for Writers Who Don’t Want to Code',
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
}

const link = 'text-amber-700 underline underline-offset-2 font-medium'

export default function TwineAlternativePage() {
  return (
    <ProductLanding
      path={PATH}
      eyebrow={{ icon: Shuffle, label: 'Twine Alternative' }}
      title={['A Twine Alternative for', 'Writers, Not Coders']}
      schemaName="Twine Alternative"
      subtitle="Twine is a brilliant, free tool. StoryQuestor is for when you'd rather skip the markup and the hosting, and get straight to writing and sharing."
      intro={{
        heading: 'When Twine Is Great, and When It Isn’t',
        paragraphs: [
          <>Twine is free, open source and has powered thousands of interactive stories. If you enjoy tinkering with story formats like Harlowe or SugarCube, writing macros for variables, and styling your story with CSS, it&apos;s a fantastic choice, and we&apos;re fans.</>,
          <>But many writers just want to tell a branching story. In Twine, tracking anything beyond simple links means learning a story format&apos;s syntax, and publishing means exporting an HTML file and finding somewhere to host it. StoryQuestor handles that for you: stats and items are set up with menus instead of code, and every story gets a shareable link, a place on the Explore page, ratings and reviews.</>,
          <>And you&apos;re not locked in. Paid plans can <Link href="/guide/export-to-twine" className={link}>export any story to Twine</Link>, so you can start here and move to Twine later if you outgrow us.</>,
        ],
      }}
      comparison={{
        heading: 'StoryQuestor vs Twine at a Glance',
        intro: 'Both tools make branching stories. The difference is how much you want to manage yourself.',
        columns: ['StoryQuestor', 'Twine'],
        rows: [
          { label: 'Visual story map', a: true, b: true },
          { label: 'Write without code or markup', a: true, b: 'Simple links only' },
          { label: 'Stats, items and combat', a: 'Built in, no code', b: 'Via story format code' },
          { label: 'Hosting and shareable link', a: true, b: 'Host the HTML yourself' },
          { label: 'Community page to find readers', a: true, b: false },
          { label: 'Reader ratings and reviews', a: true, b: false },
          { label: 'Scene images and soundscapes', a: 'Built in', b: 'Add your own files' },
          { label: 'Custom CSS and scripting', a: false, b: true },
          { label: 'Price', a: 'Free first story, paid plans', b: 'Free and open source' },
          { label: 'Export to the other', a: 'Exports to Twine 2', b: false },
        ],
      }}
      features={{
        heading: 'What You Get Instead of Code',
        items: [
          { icon: MousePointerClick, title: 'Point-and-click branching', body: 'Connect scenes with choices on a canvas. Nothing to type except your story.' },
          { icon: Sword, title: 'RPG systems without macros', body: 'World Builder gives characters stats, items and foe combat, configured with forms instead of variables.' },
          { icon: Globe, title: 'Hosting included', body: 'Every story gets a link that works on any device. No uploads, no web host.' },
          { icon: Star, title: 'An audience built in', body: 'Publish to Explore where readers browse by genre, rate stories and leave reviews.' },
          { icon: ImageIcon, title: 'Images and sound', body: 'Add scene illustrations and ambient soundscapes without managing asset files.' },
          { icon: Download, title: 'Twine export', body: 'Take your scenes, choices and map layout into Twine 2 any time.' },
        ],
      }}
      faqs={[
        { q: 'Is StoryQuestor a replacement for Twine?', a: 'For writers who want to focus on story rather than code, yes. If you need custom scripting or full control over styling, Twine is still the better fit, and you can export from StoryQuestor to Twine at any time.' },
        { q: 'Can I import my Twine story into StoryQuestor?', a: 'Not yet. Export goes from StoryQuestor to Twine. If importing from Twine would help you, let us know through the feedback link.' },
        { q: 'Is StoryQuestor free like Twine?', a: 'Your first story is free to write and publish. Paid plans unlock unlimited stories and extra features. Twine itself is free and open source.' },
        { q: 'What happens to World Builder stats when I export to Twine?', a: 'Scenes, choices, chapters and images carry over. Stats, items and combat do not, because Twine handles those through story format code.' },
      ]}
      related={[
        { href: '/guide/export-to-twine', title: 'How to Export Your Story to Twine', description: 'What carries over and how to import the file.', tag: 'Guide' },
        { href: '/choose-your-own-adventure-maker', title: 'Choose Your Own Adventure Maker', description: 'Build a branching adventure step by step.', tag: 'Tool' },
        { href: '/resources/interactive-fiction-history', title: 'Interactive Fiction History', description: 'From text adventures to Twine and beyond.', tag: 'Resources' },
        { href: '/branching-story-planner', title: 'Branching Story Planner', description: 'Map your plot before you write.', tag: 'Tool' },
      ]}
      cta={{ heading: 'Try it on your next story', body: 'Your first story is free, and you can export it to Twine whenever you like.' }}
    />
  )
}
