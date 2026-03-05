'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, GitBranch, Share2, Sparkles } from 'lucide-react'
import { useSession, signIn } from 'next-auth/react'
import { analytics } from '@/lib/analytics'
import AdventureCard from '@/components/shared/AdventureCard'
import type { AdventureWithCounts } from '@/lib/queries'

function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100 px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <BookOpen size={14} />
            Interactive Storytelling
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Create Stories Where<br />
            <span className="text-amber-500">Every Choice Matters</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            Build branching adventures with a visual canvas, then share them with the world. Your readers decide the outcome.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => { analytics.landingSignInClicked('hero'); signIn('google') }}
              className="px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md transition-colors text-lg"
            >
              Start Creating — it's free
            </button>
            <Link
              href="/explore"
              className="px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-200 transition-colors text-lg"
            >
              Browse Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col items-start gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <GitBranch size={22} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Visual Story Canvas</h3>
          <p className="text-gray-500 text-sm">Drag-and-drop scenes onto a canvas and connect them with choices. See your whole story at a glance.</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Sparkles size={22} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Scene Images</h3>
          <p className="text-gray-500 text-sm">Generate cinematic illustrations for each scene automatically using AI — no art skills required.</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Share2 size={22} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Share & Play</h3>
          <p className="text-gray-500 text-sm">Publish your adventure with a link. Readers play through branching paths and discover every outcome.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to tell your story?</h2>
        <p className="text-gray-400 mb-7">Sign in with Google and start building in minutes.</p>
        <button
          onClick={() => { analytics.landingSignInClicked('cta_bottom'); signIn('google') }}
          className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Sign in with Google
        </button>
      </section>
    </div>
  )
}

function Dashboard() {
  const [adventures, setAdventures] = useState<AdventureWithCounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/adventures')
      .then(r => r.json())
      .then(data => { setAdventures(data); setLoading(false) })
    fetch('/api/generate-images', { method: 'POST' })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this adventure?')) return
    await fetch(`/api/adventures/${id}`, { method: 'DELETE' })
    setAdventures(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Adventures</h1>
          <p className="text-gray-500 mt-1">Create and play branching stories</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Adventure
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : adventures.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No adventures yet. Create your first one!</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            <Plus size={18} />
            Create Adventure
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adventures.map(adventure => (
            <AdventureCard key={adventure.id} adventure={adventure} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="text-center py-20 text-gray-400">Loading…</div>
  }

  return status === 'authenticated' ? <Dashboard /> : <LandingPage />
}
