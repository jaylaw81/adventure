'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AdventureCard from '@/components/shared/AdventureCard'
import type { AdventureWithCounts } from '@/lib/queries'

export default function HomePage() {
  const [adventures, setAdventures] = useState<AdventureWithCounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/adventures')
      .then(r => r.json())
      .then(data => { setAdventures(data); setLoading(false) })
    // Silently generate images for any completed scenes that don't have one yet
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
