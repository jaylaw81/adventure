import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import StoryLanding, { storyLandingMetadata } from '@/components/reader/StoryLanding'

// Canonical public URL for a story. /play/[id] redirects here once a story has a slug.

interface Props {
  params: Promise<{ slug: string }>
}

async function idForSlug(slug: string): Promise<string | null> {
  const [adventure] = await db
    .select({ id: adventures.id })
    .from(adventures)
    .where(eq(adventures.storySlug, slug))
    .limit(1)
  return adventure?.id ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await idForSlug((await params).slug)
  return id ? storyLandingMetadata(id) : { title: 'Story Not Found' }
}

export default async function StorySlugPage({ params }: Props) {
  const id = await idForSlug((await params).slug)
  if (!id) notFound()
  return <StoryLanding id={id} />
}
