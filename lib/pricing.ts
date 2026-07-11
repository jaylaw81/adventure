import { db } from '@/lib/db'
import { siteSettings } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export type BillingInterval = 'day' | 'week' | 'month'

export type IntervalConfig = {
  interval: BillingInterval
  enabled: boolean
  priceCents: number
}

export type PricingConfig = {
  defaultInterval: BillingInterval
  intervals: IntervalConfig[]
}

export const DEFAULT_PRICING: PricingConfig = {
  defaultInterval: 'week',
  intervals: [
    { interval: 'day',   enabled: false, priceCents: 50  },
    { interval: 'week',  enabled: true,  priceCents: 200 },
    { interval: 'month', enabled: false, priceCents: 800 },
  ],
}

/** Format cents as a dollar string: 200 → "$2", 50 → "$0.50" */
export function formatCents(cents: number): string {
  const d = cents / 100
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`
}

/** "day" → "Daily", "week" → "Weekly", "month" → "Monthly" */
export function intervalLabel(i: BillingInterval): string {
  return i === 'day' ? 'Daily' : i === 'week' ? 'Weekly' : 'Monthly'
}

/** Get the effective default interval config */
export function getDefaultInterval(config: PricingConfig): IntervalConfig {
  return (
    config.intervals.find(i => i.interval === config.defaultInterval && i.enabled) ??
    config.intervals.find(i => i.enabled) ??
    config.intervals[0]
  )
}

/** Get config for a specific interval */
export function getIntervalConfig(config: PricingConfig, interval: BillingInterval): IntervalConfig | undefined {
  return config.intervals.find(i => i.interval === interval)
}

/** Get only enabled intervals */
export function getEnabledIntervals(config: PricingConfig): IntervalConfig[] {
  return config.intervals.filter(i => i.enabled)
}

/** "$2/week", "$0.50/day", "$8/month" — for site-wide copy */
export function getMinPriceCopy(config: PricingConfig): string {
  const ic = getDefaultInterval(config)
  return `${formatCents(ic.priceCents)}/${ic.interval}`
}

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'pricing_config'))
      .limit(1)
    if (row?.value) {
      const parsed = JSON.parse(row.value)
      // Current format: { defaultInterval, intervals: [{ interval, enabled, priceCents }] }
      if (Array.isArray(parsed?.intervals) && parsed.intervals.length > 0) {
        // Migrate old preset format: intervals may have minimumCents instead of priceCents
        return {
          ...DEFAULT_PRICING,
          ...parsed,
          intervals: DEFAULT_PRICING.intervals.map(def => {
            const saved = parsed.intervals.find((x: IntervalConfig & { minimumCents?: number }) => x.interval === def.interval)
            if (!saved) return def
            return {
              ...def,
              enabled: saved.enabled ?? def.enabled,
              priceCents: saved.priceCents ?? saved.minimumCents ?? def.priceCents,
            }
          }),
        } as PricingConfig
      }
      // Legacy flat format: { minimumCents, presets }
      const legacy = parsed as { minimumCents?: number }
      if (legacy?.minimumCents) {
        return {
          ...DEFAULT_PRICING,
          intervals: DEFAULT_PRICING.intervals.map(ic =>
            ic.interval === 'week' ? { ...ic, priceCents: legacy.minimumCents! } : ic
          ),
        }
      }
    }
  } catch {}
  return DEFAULT_PRICING
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: 'pricing_config', value: JSON.stringify(config) })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: JSON.stringify(config), updatedAt: new Date() },
    })
}
