import DemoCanvas from '@/components/editor/DemoCanvas'

export const metadata = {
  title: { absolute: 'Try the Story Editor — StoryQuestor Demo' },
  description: 'Try the StoryQuestor story editor for free — no account needed. Edit scenes, connect choices, and see how branching stories are built.',
  robots: { index: true, follow: true },
}

export default function DemoPage() {
  return <DemoCanvas />
}
