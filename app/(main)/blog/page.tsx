import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/schema'
import { seedBlogPostsIfEmpty } from '@/lib/blogSeed'
import { ArrowRight, Clock } from 'lucide-react'
import type { BlogCategory } from '@/lib/blogPosts'
import JsonLd from '@/components/JsonLd'

const SITE_URL = 'https://storyquestor.com'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Writing Tips & Interactive Fiction Guides | StoryQuestor Blog',
  description: 'Tips for writing branching stories, interactive fiction guides, choose-your-own-adventure ideas, and resources for story creators.',
}

const CATEGORY_PILL: Record<BlogCategory, string> = {
  'Writing Tips':        'bg-violet-100 text-violet-800',
  'Interactive Fiction': 'bg-blue-100 text-blue-800',
  'Story Ideas':         'bg-amber-100 text-amber-800',
  'History':             'bg-emerald-100 text-emerald-800',
  'Education':           'bg-teal-100 text-teal-800',
}

const CATEGORY_DARK_PANEL: Record<BlogCategory, string> = {
  'Writing Tips':        '#4c1d95',
  'Interactive Fiction': '#1e3a8a',
  'Story Ideas':         '#92400e',
  'History':             '#064e3b',
  'Education':           '#134e4a',
}

function formatDate(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function BlogIndexPage() {
  await seedBlogPostsIfEmpty()

  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt))

  const [featured, ...rest] = posts

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog`,
    name: 'The StoryQuestor Blog',
    url: `${SITE_URL}/blog`,
    description: 'Writing tips, interactive fiction guides, and story ideas for branching narrative creators.',
    publisher: {
      '@type': 'Organization',
      name: 'StoryQuestor',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
    },
    inLanguage: 'en',
    blogPost: posts.slice(0, 10).map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      url: `${SITE_URL}/blog/${p.slug}`,
      author: { '@type': 'Organization', name: 'StoryQuestor', url: SITE_URL },
    })),
  }

  return (
    <div className="min-h-screen" style={{ background: '#faf5ff' }}>
      <JsonLd data={blogSchema} />

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #130b20 0%, #0f172a 55%, #1a0f2e 100%)',
          paddingTop: '4rem',
          paddingBottom: featured ? '4.5rem' : '4rem',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-24 -left-16 w-[480px] h-[480px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.28) 0%, transparent 65%)' }}
          />
          <div
            className="absolute top-0 right-0 w-[320px] h-[320px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.09) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight"
            style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
          >
            The StoryQuestor Blog
          </h1>
          <p className="text-slate-300/80 text-base sm:text-lg max-w-md leading-relaxed">
            Guides, tips, and ideas for writing interactive fiction.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5">

        {/* ── Featured Post ── */}
        {featured && (
          <div className="-mt-10 mb-14 relative z-10">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block bg-white rounded-xl overflow-hidden border border-violet-200 hover:border-violet-400 transition-colors duration-200"
            >
              <div className="grid md:grid-cols-[2fr_3fr]">

                {/* Left: hero image or category panel */}
                <div
                  className="relative min-h-[200px] md:min-h-[300px]"
                  style={{
                    background: !featured.heroImageUrl
                      ? (CATEGORY_DARK_PANEL[featured.category as BlogCategory] ?? '#4c1d95')
                      : undefined,
                  }}
                >
                  {featured.heroImageUrl ? (
                    <>
                      <Image
                        src={featured.heroImageUrl}
                        alt={featured.title}
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 p-5">
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${
                      featured.heroImageUrl
                        ? 'bg-white/15 text-white backdrop-blur-sm'
                        : (CATEGORY_PILL[featured.category as BlogCategory] ?? 'bg-gray-100 text-gray-800')
                    }`}>
                      {featured.category}
                    </span>
                  </div>
                </div>

                {/* Right: content */}
                <div className="p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-400 mb-5">
                      <Clock size={11} />
                      <span>{featured.readingMinutes} min read</span>
                      <span aria-hidden>·</span>
                      <time>{formatDate(featured.publishedAt)}</time>
                    </div>

                    <h2
                      className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-violet-700 transition-colors duration-200"
                      style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
                    >
                      {featured.title}
                    </h2>

                    <p className="text-gray-600 text-base leading-relaxed line-clamp-3">
                      {featured.description}
                    </p>
                  </div>

                  <div className="mt-8 inline-flex items-center gap-1.5 text-violet-700 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Read article <ArrowRight size={14} />
                  </div>
                </div>

              </div>
            </Link>
          </div>
        )}

        {/* ── Post Grid ── */}
        {rest.length > 0 && (
          <div
            className="grid gap-5 pb-16"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}
          >
            {rest.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-xl overflow-hidden border border-violet-100 hover:border-violet-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                {post.heroImageUrl && (
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <Image
                      src={post.heroImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      unoptimized
                    />
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <span className={`inline-flex self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${CATEGORY_PILL[post.category as BlogCategory] ?? 'bg-gray-100 text-gray-800'}`}>
                    {post.category}
                  </span>

                  <h2
                    className="text-gray-900 font-bold text-base leading-snug mb-2 group-hover:text-violet-700 transition-colors duration-200 line-clamp-2"
                    style={{ textWrap: 'balance' } as React.CSSProperties}
                  >
                    {post.title}
                  </h2>

                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      {post.readingMinutes} min
                    </div>
                    <time>{formatDate(post.publishedAt)}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <p className="text-center text-gray-400 py-24">No posts yet.</p>
        )}

      </div>

      {/* ── CTA ── */}
      <div className="border-t border-violet-100">
        <div className="max-w-6xl mx-auto px-5 py-14 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1.5">Ready to write your own story?</h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              StoryQuestor gives you a visual canvas to build branching stories, manage characters, and share your work with readers.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            Start creating free <ArrowRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  )
}
