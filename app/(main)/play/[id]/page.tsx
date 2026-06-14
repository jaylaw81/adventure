import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Tag, Users, ShieldOff } from 'lucide-react'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdventure, getStartNode } from '@/lib/queries'
import { canViewMemberStory } from '@/lib/orgAccess'
import StartStoryButton from '@/components/reader/StartStoryButton'
import ReportButton from '@/components/reader/ReportButton'
import ReviewsSection from '@/components/reader/ReviewsSection'
import JsonLd from '@/components/JsonLd'

const SITE_URL = 'https://www.storyquestor.com'

const AUDIENCE_SCHEMA: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teenagers',
  adults: 'Adults',
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults Only',
}

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const adventure = await getAdventure(id)
  if (!adventure) return { title: 'Story Not Found' }

  const title = `${adventure.title} | StoryQuestor`
  const description = adventure.description || `Play "${adventure.title}" — a branching interactive story on StoryQuestor.`
  const tags: string[] = (() => { try { return JSON.parse(adventure.tags ?? '[]') } catch { return [] } })()
  const ogImage = `${SITE_URL}/play/${id}/opengraph-image`

  return {
    title,
    description,
    keywords: ['interactive story', 'choose your own adventure', 'branching story', ...tags],
    alternates: { canonical: `${SITE_URL}/play/${id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/play/${id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: adventure.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function StoryLandingPage({ params }: Props) {
  const { id } = await params
  const [adventure, startNode, session] = await Promise.all([
    getAdventure(id),
    getStartNode(id),
    getServerSession(authOptions),
  ])

  if (!adventure) notFound()
  if (!startNode) redirect('/')

  // Block private stories from non-owners
  const isOwner = !!session?.user?.email && session.user.email === adventure.userEmail
  const isAdmin = !!session?.user?.isAdmin
  const isOrgAdmin = session?.user?.tier === 'organization'
  if (!adventure.isPublic && !isOwner && !isAdmin) {
    const orgAccess = session?.user?.email && adventure.userEmail
      ? await canViewMemberStory(session.user.email, adventure.userEmail)
      : false
    if (!orgAccess) notFound()
  }

  // Block suspended stories — org admins can still view
  if (adventure.status === 'suspended' && !isOrgAdmin && !isAdmin) notFound()

  // Block adults-only stories for non-adults and unauthenticated users
  if (adventure.audience === 'adults' && !session?.user?.isAdult) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <ShieldOff size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Adults Only Content</h1>
        <p className="text-gray-500 mb-6">
          {session
            ? 'You must be 18 or older to access this story. Update your date of birth in your profile settings.'
            : 'You must be signed in and 18 or older to access this story.'}
        </p>
        <Link
          href={session ? '/profile' : '/sign-in'}
          className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
        >
          {session ? 'Go to Profile' : 'Sign In'}
        </Link>
      </div>
    )
  }

  const tags: string[] = (() => {
    try { return JSON.parse(adventure.tags ?? '[]') } catch { return [] }
  })()

  const audienceLabel = AUDIENCE_LABEL[adventure.audience ?? 'all'] ?? adventure.audience

  const storySchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: adventure.title,
    ...(adventure.description && { description: adventure.description }),
    url: `${SITE_URL}/play/${id}`,
    ...(tags.length > 0 && { genre: tags }),
    interactivityType: 'active',
    audience: {
      '@type': 'Audience',
      audienceType: AUDIENCE_SCHEMA[adventure.audience ?? 'all'] ?? 'All Ages',
    },
    datePublished: new Date(adventure.createdAt).toISOString().split('T')[0],
    ...(startNode.imageUrl && { image: startNode.imageUrl }),
    publisher: {
      '@type': 'Organization',
      name: 'StoryQuestor',
      url: SITE_URL,
    },
  }

  return (
    <>
    <div className="-mt-16 pt-8 pb-4 px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 50%, #0f172a 100%)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(124,58,237,0.2) 0%, transparent 65%)' }} />
      <div className="relative max-w-2xl mx-auto pt-16">
        <Link href="/" className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
          ← Back to stories
        </Link>
      </div>
    </div>
    <div className="max-w-2xl mx-auto px-6 py-10">
      <JsonLd data={storySchema} />

      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
        {/* Color accent strip when no image */}
        {!startNode.imageUrl && (
          <div className="h-2" style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
        )}
        {/* Cover image from start node */}
        {startNode.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={startNode.imageUrl}
            alt={adventure.title}
            className="w-full h-56 object-cover"
          />
        )}

        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl font-extrabold" style={{ color: '#1e0a3c' }}>{adventure.title}</h1>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
              <Users size={11} />
              {audienceLabel}
            </span>
          </div>

          {adventure.description && (
            <p className="text-base leading-relaxed mb-5" style={{ color: '#374151' }}>{adventure.description}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <StartStoryButton
            href={`/play/${id}/${startNode.id}`}
            audience={adventure.audience ?? 'all'}
          />
        </div>
      </div>

      <ReviewsSection adventureId={id} />

      <div className="flex items-center justify-between mt-8">
        <p className="text-xs text-gray-400">
          Made with{' '}
          <Link href="/" className="hover:text-violet-500 transition-colors">
            StoryQuestor
          </Link>
        </p>
        <ReportButton adventureId={id} />
      </div>
    </div>
    </>
  )
}
