import { stripe } from '@/lib/stripe'

// Marks pauses made by a suspension, so unsuspending never restarts a pause the subscriber chose themselves.
const MARKER = 'paused_by_suspension'

/** Stops charges while an account is suspended. Invoices are voided, so nothing is owed for this time. */
export async function pauseBillingForSuspension(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  if (subscription.pause_collection) return // already paused
  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: { behavior: 'void' },
    metadata: { [MARKER]: 'true' },
  })
}

/** Restarts charges when a suspension is lifted, but only if the suspension is what paused them. */
export async function resumeBillingAfterSuspension(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  if (subscription.metadata[MARKER] !== 'true') return
  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: '',
    metadata: { [MARKER]: '' },
  })
}
