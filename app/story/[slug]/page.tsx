import { db } from '@/lib/db'
import { adventures } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { permanentRedirect, notFound } from 'next/navigation'

export default async function StorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [adventure] = await db
    .select({ id: adventures.id })
    .from(adventures)
    .where(eq(adventures.storySlug, slug))
    .limit(1)

  if (!adventure) notFound()
  permanentRedirect(`/play/${adventure.id}`)
}
