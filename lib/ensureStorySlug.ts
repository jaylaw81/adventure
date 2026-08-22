import { and, eq, ne } from 'drizzle-orm'
import { db } from './db'
import { adventures } from './schema'
import { titleToSlug, randomSuffix } from './slugUtils'

async function isSlugTaken(candidate: string, excludeId: string): Promise<boolean> {
  const rows = await db
    .select({ id: adventures.id })
    .from(adventures)
    .where(and(eq(adventures.storySlug, candidate), ne(adventures.id, excludeId)))
    .limit(1)
  return rows.length > 0
}

/** Generates a slug from a title, appending a numeric or random suffix if it collides with another story. */
export async function generateUniqueSlug(title: string, excludeId: string): Promise<string> {
  const baseSlug = titleToSlug(title)
  if (!await isSlugTaken(baseSlug, excludeId)) return baseSlug

  for (let i = 2; i <= 9; i++) {
    const candidate = `${baseSlug}-${i}`
    if (!await isSlugTaken(candidate, excludeId)) return candidate
  }
  return `${baseSlug}-${randomSuffix()}`
}

/**
 * Every public story gets an SEO-friendly /story/[slug] URL. Generates and persists one
 * if this story doesn't have one yet; otherwise returns the existing slug unchanged.
 */
export async function ensureStorySlug(id: string, title: string, currentSlug: string | null): Promise<string> {
  if (currentSlug) return currentSlug
  const slug = await generateUniqueSlug(title, id)
  await db.update(adventures).set({ storySlug: slug }).where(eq(adventures.id, id))
  return slug
}
