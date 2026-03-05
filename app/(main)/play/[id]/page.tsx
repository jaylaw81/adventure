import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Tag, Users, ShieldOff } from 'lucide-react'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdventure, getStartNode } from '@/lib/queries'
import StartStoryButton from '@/components/reader/StartStoryButton'

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

  const title = `${adventure.title} | Adventure Maker`
  const description = adventure.description || `Play "${adventure.title}" — a branching interactive story on Adventure Maker.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Back */}
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-10 inline-block">
        ← Home
      </Link>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
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
            <h1 className="text-3xl font-extrabold text-gray-900">{adventure.title}</h1>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              <Users size={11} />
              {audienceLabel}
            </span>
          </div>

          {adventure.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-5">{adventure.description}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
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

      <p className="text-center text-xs text-gray-400 mt-8">
        Made with{' '}
        <Link href="/" className="hover:text-amber-500 transition-colors">
          Adventure Maker
        </Link>
      </p>
    </div>
  )
}
