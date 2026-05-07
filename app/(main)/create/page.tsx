'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { analytics } from '@/lib/analytics'
import PageBanner from '@/components/shared/PageBanner'

export default function CreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })
      const adventure = await res.json()
      analytics.adventureCreated(title.trim())
      router.push(`/edit/${adventure.id}`)
    } catch {
      setError('Failed to create story')
      setLoading(false)
    }
  }

  return (
    <>
      <PageBanner
        title="New Story"
        subtitle="Give your adventure a name and a premise"
        action={
          <Link href="/" className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
            <ArrowLeft size={15} />
            Back
          </Link>
        }
      />

      <div className="max-w-lg mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-violet-100 p-7 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e0a3c' }}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="The Lost Kingdom…"
              className="w-full border border-violet-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              style={{ color: '#1e0a3c' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e0a3c' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A short description of your story…"
              rows={3}
              className="w-full border border-violet-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              style={{ color: '#1e0a3c' }}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            {loading ? 'Creating…' : 'Create & Start Editing'}
          </button>
        </form>
      </div>
    </>
  )
}
