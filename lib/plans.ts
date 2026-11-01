// Client-safe plan helpers (lib/pricing.ts imports the DB, so client components can't use it).

/** Monthly and yearly plans include the premium features: images, portraits, sounds, analytics, custom URLs. */
export function isPremiumInterval(interval: string | null | undefined): boolean {
  return interval === 'month' || interval === 'year'
}
