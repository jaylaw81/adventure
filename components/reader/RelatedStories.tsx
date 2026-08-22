import Link from 'next/link'
import { BookOpen, Play } from 'lucide-react'
import type { RelatedStory } from '@/lib/queries'

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Ages',
  teens: 'Teens',
  adults: 'Adults Only',
}

function storyPath(story: RelatedStory): string {
  return story.storySlug ? `/story/${story.storySlug}` : `/play/${story.id}`
}

interface Props {
  stories: RelatedStory[]
  dark?: boolean
}

export default function RelatedStories({ stories, dark = false }: Props) {
  if (stories.length === 0) return null

  return (
    <div className="mt-10 pt-8" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#f3f4f6'}` }}>
      <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dark ? 'text-white/60' : 'text-gray-500'}`}>
        Read Another Story
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stories.map(story => (
          <Link
            key={story.id}
            href={storyPath(story)}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              dark
                ? 'border-white/10 hover:border-violet-400/40 hover:bg-white/5'
                : 'border-gray-100 hover:border-violet-200 hover:bg-violet-50/50'
            }`}
          >
            {story.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.coverImageUrl}
                alt={story.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: dark ? 'rgba(167,139,250,0.15)' : '#ede9fe' }}
              >
                <BookOpen size={20} className={dark ? 'text-violet-300' : 'text-violet-400'} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold truncate ${dark ? 'text-white/90' : 'text-gray-800'}`}>
                {story.title}
              </p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-white/40' : 'text-gray-400'}`}>
                {AUDIENCE_LABEL[story.audience] ?? story.audience}
              </p>
            </div>
            <Play size={14} className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${dark ? 'text-violet-300' : 'text-violet-500'}`} />
          </Link>
        ))}
      </div>
    </div>
  )
}
