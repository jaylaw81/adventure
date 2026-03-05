'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { analytics } from '@/lib/analytics'

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
    } catch (e) {
      setError('Failed to create adventure')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-8 text-sm">
        <ArrowLeft size={16} />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Adventure</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="The Lost Kingdom…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="A short description of your adventure…"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create & Start Editing'}
        </button>
      </form>
    </div>
  )
}
