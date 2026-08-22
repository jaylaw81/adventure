'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, Sparkles, Globe } from 'lucide-react'
import { useSession } from 'next-auth/react'
import AdventureCard from '@/components/shared/AdventureCard'
import PageBanner from '@/components/shared/PageBanner'
import type { AdventureWithCounts } from '@/lib/queries'

export default function Dashboard() {
  const { data: session } = useSession()
  const [adventures, setAdventures] = useState<AdventureWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [canMakePublic, setCanMakePublic] = useState(true)
  const [canMakePrivate, setCanMakePrivate] = useState(true)
  const [imagesGenerating, setImagesGenerating] = useState(false)
  const [imagesGenerated, setImagesGenerated] = useState(0)
  const [showPrivateNudge, setShowPrivateNudge] = useState(false)

  const dismissPrivateNudge = () => {
    const n = adventures.filter(a => !a.isPublic).length
    try {
      localStorage.setItem('private_nudge_v1', JSON.stringify({ dismissedAt: Date.now(), dismissedCount: n }))
    } catch {}
    setShowPrivateNudge(false)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/adventures').then(r => r.json()),
      fetch('/api/org/me').then(r => r.json()),
    ]).then(([data, orgData]) => {
      setAdventures(data)
      const canPublish = !(orgData?.orgPrivacyLevel && orgData.orgPrivacyLevel !== 'public')
      if (!canPublish) setCanMakePublic(false)
      // Private stories require an active subscription (not just a trial)
      const subStatus = session?.user?.subscriptionStatus
      const isActiveSubscriber =
        subStatus === 'active' ||
        session?.user?.tier === 'organization' ||
        !!session?.user?.isAdmin
      setCanMakePrivate(isActiveSubscriber)
      setLoading(false)

      if (canPublish && Array.isArray(data)) {
        const privateCount = (data as AdventureWithCounts[]).filter(a => !a.isPublic).length
        if (privateCount > 0) {
          let shouldShow = true
          try {
            const raw = localStorage.getItem('private_nudge_v1')
            if (raw) {
              const { dismissedAt, dismissedCount } = JSON.parse(raw)
              const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
              if (daysSince < 7 && privateCount <= dismissedCount) shouldShow = false
            }
          } catch {}
          if (shouldShow) setShowPrivateNudge(true)
        }
      }
    })

    setImagesGenerating(true)
    fetch('/api/generate-images', { method: 'POST' })
      .then(r => r.json())
      .then(data => { if (data?.processed > 0) setImagesGenerated(data.processed) })
      .catch(() => {})
      .finally(() => setImagesGenerating(false))
  }, [])

  const handleDelete = async (id: string) => {
    await fetch(`/api/adventures/${id}`, { method: 'DELETE' })
    setAdventures(prev => prev.filter(a => a.id !== id))
  }

  const firstName = session?.user?.name?.split(' ')[0]

  const isFreeTier = !!session?.user &&
    !session.user.isAdmin &&
    session.user.tier !== 'organization' &&
    !['active', 'trialing'].includes(session.user.subscriptionStatus ?? '')

  const canViewAnalytics = !!session?.user && (
    session.user.subscriptionInterval === 'month' ||
    !!session.user.isAdmin
  )

  const atFreeLimit = !loading && isFreeTier && adventures.length >= 1

  return (
    <>
      <PageBanner
        title={firstName ? `${firstName}'s Stories` : 'Your Stories'}
        subtitle="Create and play branching adventures"
        action={
          atFreeLimit ? (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:brightness-110 shadow-sm whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <Sparkles size={18} />
              Upgrade to Create More
            </Link>
          ) : (
            <Link
              href="/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:brightness-110 shadow-sm whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
            >
              <Plus size={18} />
              New Story
            </Link>
          )
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showPrivateNudge && (() => {
          const n = adventures.filter(a => !a.isPublic).length
          return n > 0 ? (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Globe size={14} className="text-amber-500 shrink-0" />
              <span>
                {canMakePrivate
                  ? <>You have {n} private {n === 1 ? 'story' : 'stories'} — toggle &ldquo;Make public&rdquo; on any card to share {n === 1 ? 'it' : 'them'} with the world.</>
                  : <>You have {n} unpublished {n === 1 ? 'story' : 'stories'}. Toggle &ldquo;Make public&rdquo; to share, or <Link href="/pricing" className="underline font-medium hover:text-amber-900">subscribe</Link> to keep {n === 1 ? 'it' : 'them'} private.</>
                }
              </span>
              <button onClick={dismissPrivateNudge} className="ml-auto text-amber-600 hover:text-amber-800 text-xs shrink-0">✕</button>
            </div>
          ) : null
        })()}
        {imagesGenerated > 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm text-violet-800">
            <Sparkles size={14} className="text-violet-500 shrink-0" />
            Images generated for {imagesGenerated} scene{imagesGenerated !== 1 ? 's' : ''}. Open a story to see them.
            <button onClick={() => setImagesGenerated(0)} className="ml-auto text-violet-600 hover:text-violet-800 text-xs">✕</button>
          </div>
        )}
        {imagesGenerating && !imagesGenerated && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-2.5 text-xs text-violet-600">
            <Sparkles size={13} className="text-violet-300 shrink-0 animate-pulse" />
            Checking for scenes to illustrate…
          </div>
        )}
        {isFreeTier && !loading && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
            <p className="flex-1 text-sm text-violet-800">
              <span className="font-semibold">Free plan</span> — 1 public story using Block Builder only.{' '}
              <Link href="/pricing" className="font-medium underline hover:text-violet-900">Upgrade</Link>{' '}
              for unlimited stories, Node Graph &amp; World Builder, and scene images.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-violet-600">Loading…</div>
        ) : adventures.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border-2 border-dashed border-violet-200"
            style={{ background: '#f5f3ff' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#ede9fe' }}>
              <BookOpen size={28} style={{ color: '#7c3aed' }} />
            </div>
            <p className="text-lg font-semibold mb-1" style={{ color: '#1e0a3c' }}>No stories yet</p>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Create your first branching adventure!</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-sm transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              <Plus size={18} />
              Create Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {adventures.map(adventure => (
              <AdventureCard key={adventure.id} adventure={adventure} onDelete={handleDelete} canMakePublic={canMakePublic} canMakePrivate={canMakePrivate} canViewAnalytics={canViewAnalytics} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
