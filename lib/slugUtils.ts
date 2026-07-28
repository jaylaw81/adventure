export function titleToSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'story'
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}
