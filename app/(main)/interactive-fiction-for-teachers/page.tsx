import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, PenLine, Brain, ShieldCheck, Users, BookOpen, Languages } from 'lucide-react'
import ProductLanding from '@/components/content/ProductLanding'

const SITE_URL = 'https://www.storyquestor.com'
const PATH = '/interactive-fiction-for-teachers'
const DESCRIPTION = 'Use interactive fiction in the classroom. Students write branching stories that build narrative structure, cause-and-effect thinking and empathy, in a private, teacher-managed space.'

export const metadata: Metadata = {
  title: { absolute: 'Interactive Fiction for Teachers & Classrooms | StoryQuestor' },
  description: DESCRIPTION,
  keywords: ['interactive fiction for teachers', 'interactive fiction in the classroom', 'choose your own adventure classroom', 'branching story writing activity', 'creative writing tool for students'],
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: 'Interactive Fiction for Teachers',
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    siteName: 'StoryQuestor',
    images: [{ url: `${SITE_URL}/storyquestor-fb.png`, width: 1200, height: 630, alt: 'StoryQuestor' }],
  },
}

const link = 'text-amber-700 underline underline-offset-2 font-medium'

export default function InteractiveFictionForTeachersPage() {
  return (
    <ProductLanding
      path={PATH}
      eyebrow={{ icon: GraduationCap, label: 'For Teachers' }}
      title={['Interactive Fiction', 'in the Classroom']}
      schemaName="Interactive Fiction for Teachers"
      subtitle="Students don't just write a story, they design one. Branching fiction makes plot, consequence and point of view visible in a way a linear essay can't."
      intro={{
        heading: 'Why Branching Stories Work for Teaching Writing',
        paragraphs: [
          <>When students write a choose your own adventure, every decision point forces them to ask: what would realistically happen next? What does this character want? That&apos;s cause and effect, motivation and consequence, practiced dozens of times in a single assignment.</>,
          <>The visual story map also makes structure concrete. Students can see where their plot branches, where it converges, and which paths dead-end. Concepts like rising action and resolution stop being abstract when there are four different endings to plan.</>,
          <>And it&apos;s motivating. Students write for an audience of classmates who will actually play their story and try to find every ending. For more classroom ideas, read our <Link href="/blog/interactive-fiction-classroom" className={link}>teacher&apos;s guide to interactive fiction</Link>.</>,
        ],
      }}
      steps={{
        heading: 'A Simple Classroom Workflow',
        items: [
          { title: 'Set up your organization', body: 'Create a private space for your class or school. Students join by invitation, not public sign-up.' },
          { title: 'Introduce the format', body: 'Have students play a few stories first, then discuss what made the choices feel meaningful.' },
          { title: 'Plan on the canvas', body: 'Students map their branches before writing, which makes it easy to check structure early.' },
          { title: 'Write, review and share', body: 'Review student stories from your dashboard, then let classmates play and review each other’s work.' },
        ],
      }}
      features={{
        heading: 'Built for Classrooms',
        items: [
          { icon: ShieldCheck, title: 'Private by default', body: 'Student stories stay inside your organization unless you choose to publish them.' },
          { icon: Users, title: 'Student management', body: 'Invite students, organize them into groups and see their stories from one dashboard.' },
          { icon: PenLine, title: 'Consent forms', body: 'Collect parent or guardian consent before students start, with a record you can refer back to.' },
          { icon: Brain, title: 'Critical thinking', body: 'Every branch is a hypothesis about consequences, which makes it great practice in reasoning.' },
          { icon: BookOpen, title: 'Storybook mode', body: 'Younger students can create picture-book style stories page by page.' },
          { icon: Languages, title: 'Language learners', body: 'Readers can translate stories as they play, which helps multilingual classrooms.' },
        ],
      }}
      faqs={[
        { q: 'What age is StoryQuestor suitable for?', a: 'Storybook mode works for younger students, and the full branching editor suits middle school through university. Stories can be marked for all ages, teens or adults.' },
        { q: 'Are student stories public?', a: 'Not unless you choose to publish them. In an organization, student work stays private to your class or school.' },
        { q: 'Does it work on Chromebooks?', a: 'Yes. StoryQuestor runs in the browser, so there is nothing to install.' },
        { q: 'How do I get StoryQuestor for my school?', a: 'Apply for an organization account from the For Schools page and we will help you set it up.' },
      ]}
      related={[
        { href: '/organizations', title: 'StoryQuestor for Schools', description: 'Organization accounts, student invitations and consent forms.', tag: 'Schools' },
        { href: '/blog/interactive-fiction-classroom', title: "Interactive Fiction in the Classroom: A Teacher's Guide", description: 'Lesson ideas and practical tips.', tag: 'Blog' },
        { href: '/guide/how-to-create-meaningful-choices', title: 'How to Create Meaningful Choices', description: 'A great mini-lesson before students start writing.', tag: 'Guide' },
        { href: '/branching-story-planner', title: 'Branching Story Planner', description: 'Help students map their plot before they draft.', tag: 'Tool' },
      ]}
      cta={{ heading: 'Bring branching stories to your class', body: 'Try it yourself for free, then set up a private space for your students.' }}
    />
  )
}
