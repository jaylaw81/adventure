import { titleToSlug } from './slugUtils'

export const STORY_TAGS = [
  'Adventure',
  'Comedy',
  'Crime',
  'Drama',
  'Dystopian',
  'Fairy Tale',
  'Fantasy',
  'Historical',
  'Horror',
  'Mystery',
  'Non-Fiction',
  'Post-Apocalyptic',
  'Romance',
  'Sci-Fi',
  'Steampunk',
  'Supernatural',
  'Thriller',
  'Western',
] as const

export type StoryTag = (typeof STORY_TAGS)[number]

/** SEO-friendly URL segment for a tag, e.g. "Sci-Fi" -> "sci-fi", "Post-Apocalyptic" -> "post-apocalyptic". */
export function tagToSlug(tag: string): string {
  return titleToSlug(tag)
}
