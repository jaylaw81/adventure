import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emailEvents, funnelEvents, subscriptionEvents } from '@/lib/schema'

/**
 * Removes a deleted account's tracking data. Subscription history is kept for revenue reporting,
 * but without the email or the free-text comment, which could identify the person.
 */
export async function removeTrackingData(email: string) {
  await Promise.all([
    db.delete(funnelEvents).where(eq(funnelEvents.userEmail, email)),
    db.delete(emailEvents).where(eq(emailEvents.recipient, email)),
    db.update(subscriptionEvents)
      .set({ userEmail: null, comment: null })
      .where(eq(subscriptionEvents.userEmail, email)),
  ])
}
