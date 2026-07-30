import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { eq, desc, ne, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/schema'
import { ArrowLeft, Clock, ArrowRight, BookOpen } from 'lucide-react'
import type { BlogSection, BlogSectionImage, BlogCategory } from '@/lib/blogPosts'
import JsonLd from '@/components/JsonLd'

const SITE_URL = 'https://storyquestor.com'

export const revalidate = 300

const CATEGORY_PILL: Record<BlogCategory, string> = {
  'Writing Tips':        'bg-violet-100 text-violet-800',
  'Interactive Fiction': 'bg-blue-100 text-blue-800',
  'Story Ideas':         'bg-amber-100 text-amber-800',
  'History':             'bg-emerald-100 text-emerald-800',
  'Education':           'bg-teal-100 text-teal-800',
}

function formatDate(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function InlineImage({ img }: { img: BlogSectionImage }) {
  return (
    <figure className="my-8">
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <Image src={img.url} alt={img.alt ?? ''} fill className="object-cover" unoptimized />
      </div>
      {img.caption && (
        <figcaption className="mt-2.5 text-center text-xs text-gray-400 italic">{img.caption}</figcaption>
      )}
    </figure>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [post] = await db.select({ title: blogPosts.title, description: blogPosts.description })
    .from(blogPosts).where(eq(blogPosts.slug, slug))
  if (!post) return {}
  return {
    title: `${post.title} | StoryQuestor Blog`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [post] = await db.select().from(blogPosts).where(
    and(eq(blogPosts.slug, slug), eq(blogPosts.published, true))
  )
  if (!post) notFound()

  const related = await db.select({
    id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title,
    description: blogPosts.description, category: blogPosts.category,
    readingMinutes: blogPosts.readingMinutes, publishedAt: blogPosts.publishedAt,
    heroImageUrl: blogPosts.heroImageUrl,
  })
    .from(blogPosts)
    .where(and(eq(blogPosts.published, true), ne(blogPosts.id, post.id)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(3)

  const sections = post.sections as BlogSection[]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt.toISOString().slice(0, 10),
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    ...(post.heroImageUrl && !post.heroImageUrl.startsWith('data:')
      ? { image: post.heroImageUrl }
      : {}),
    author: { '@type': 'Organization', name: 'StoryQuestor', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'StoryQuestor',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
    },
    inLanguage: 'en',
    isPartOf: { '@type': 'Blog', '@id': `${SITE_URL}/blog`, name: 'The StoryQuestor Blog', url: `${SITE_URL}/blog` },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  }

  const heroCredit = post.heroImageCredit
    ? JSON.parse(post.heroImageCredit) as { authorName: string; authorUrl: string }
    : null

  return (
    <div className="min-h-screen" style={{ background: '#faf5ff' }}>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* ── Article header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #130b20 0%, #0f172a 55%, #1a0f2e 100%)',
          paddingTop: '3.5rem',
          paddingBottom: '3.5rem',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.09) 0%, transparent 65%)', transform: 'translate(30%, -30%)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} /> All articles
            </Link>

            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_PILL[post.category as BlogCategory] ?? 'bg-gray-100 text-gray-800'}`}>
              {post.category}
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight"
            style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
          >
            {post.title}
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-2xl" style={{ opacity: 0.8 }}>
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              {post.readingMinutes} min read
            </div>
            <span aria-hidden>·</span>
            <time>{formatDate(post.publishedAt)}</time>
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-3xl mx-auto px-5 py-12">

        {/* Hero image */}
        {post.heroImageUrl && (
          <div className="mb-10 rounded-xl overflow-hidden" style={{ position: 'relative', aspectRatio: '16/7' }}>
            <Image
              src={post.heroImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
            {heroCredit && (
              <div className="absolute bottom-0 right-0 px-3 py-1.5 text-xs text-white/70"
                style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.55))' }}>
                Photo by{' '}
                <a href={heroCredit.authorUrl} target="_blank" rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-2">{heroCredit.authorName}</a>
                {' '}on{' '}
                <a href="https://unsplash.com?utm_source=storyquestor&utm_medium=referral"
                  target="_blank" rel="noopener noreferrer" className="hover:text-white underline underline-offset-2">Unsplash</a>
              </div>
            )}
          </div>
        )}

        <article>

          {/* Intro */}
          <p
            className="text-gray-800 leading-[1.85] mb-8"
            style={{ fontSize: '1.125rem', textWrap: 'pretty' } as React.CSSProperties}
          >
            {post.intro}
          </p>

          <hr className="border-violet-200/60 mb-10" />

          {/* Sections */}
          {sections.map((section, i) => {
            const sectionImages = (section.images ?? []) as BlogSectionImage[]
            const imagesByPosition = sectionImages.reduce<Record<number, BlogSectionImage[]>>((acc, img) => {
              if (!img.url) return acc
              const k = img.afterParagraphIndex
              acc[k] = [...(acc[k] ?? []), img]
              return acc
            }, {})

            return (
              <div key={i} className={i > 0 ? 'mt-14' : ''}>
                {section.heading && (
                  <h2
                    className="relative text-2xl font-bold text-gray-900 mb-5 leading-tight pl-5"
                    style={{ letterSpacing: '-0.015em', textWrap: 'balance' } as React.CSSProperties}
                  >
                    <span
                      className="absolute left-0 top-1 bottom-0.5 w-[3px] rounded-full"
                      style={{ background: 'oklch(50% 0.27 285)' }}
                      aria-hidden
                    />
                    {section.heading}
                  </h2>
                )}

                {/* Images before paragraphs */}
                {(imagesByPosition[-1] ?? []).map((img, k) => (
                  <InlineImage key={`pre-${k}`} img={img} />
                ))}

                {section.paragraphs.map((p, j) => (
                  <div key={j}>
                    <p
                      className="text-gray-700 leading-[1.85] mb-4"
                      style={{ fontSize: '1.0625rem', textWrap: 'pretty' } as React.CSSProperties}
                    >
                      {p}
                    </p>
                    {(imagesByPosition[j] ?? []).map((img, k) => (
                      <InlineImage key={`${j}-${k}`} img={img} />
                    ))}
                  </div>
                ))}

                {section.list && section.list.length > 0 && (
                  <ul className="mt-5 space-y-3.5">
                    {section.list.map((li, k) => (
                      <li key={k} className="flex gap-3.5">
                        <div
                          className="mt-1.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: 'oklch(50% 0.27 285 / 0.12)' }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(50% 0.27 285)' }} />
                        </div>
                        <div className="text-[1.0125rem] leading-relaxed">
                          <span className="font-semibold text-gray-900">{li.item}</span>
                          {li.detail && (
                            <span className="text-gray-500"> — {li.detail}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}

          {/* In-article CTA */}
          <div className="mt-14 rounded-xl border border-violet-200 bg-violet-50/60 px-6 py-6">
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'oklch(50% 0.27 285)' }}
              >
                <BookOpen size={16} className="text-white" />
              </div>
              <div>
                <p className="text-violet-900 font-semibold text-sm mb-1.5">Write your own branching story</p>
                <p className="text-violet-800/60 text-sm leading-relaxed mb-4">
                  StoryQuestor gives you a free visual canvas to build interactive fiction with branching paths, character stats, and scene images.
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white hover:brightness-110 transition-all"
                  style={{ background: 'oklch(50% 0.27 285)' }}
                >
                  Try it free <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

        </article>

        {/* ── Related articles ── */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-violet-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">More from the blog</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border border-violet-100 hover:border-violet-300 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {r.heroImageUrl && (
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <Image
                        src={r.heroImageUrl}
                        alt={r.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <span className={`inline-flex self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${CATEGORY_PILL[r.category as BlogCategory] ?? 'bg-gray-100 text-gray-800'}`}>
                      {r.category}
                    </span>
                    <h3 className="text-gray-900 font-semibold text-sm leading-snug mb-2.5 group-hover:text-violet-700 transition-colors duration-200 line-clamp-2 flex-1">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
                      <Clock size={10} /> {r.readingMinutes} min
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
