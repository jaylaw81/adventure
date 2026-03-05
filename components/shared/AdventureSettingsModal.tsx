'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { AdventureWithCounts } from '@/lib/queries'
import { analytics } from '@/lib/analytics'
import { STORY_TAGS } from '@/lib/tags'

interface Props {
  adventure: AdventureWithCounts
  onClose: () => void
  onSave: (updated: Partial<AdventureWithCounts>) => void
}

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Ages', description: 'Family-friendly, suitable for everyone' },
  { value: 'teens', label: 'Teens', description: 'Appropriate for teenagers, no adult content' },
  { value: 'adults', label: 'Adults Only', description: 'Mature themes, adults only' },
]

export default function AdventureSettingsModal({ adventure, onClose, onSave }: Props) {
  const [title, setTitle] = useState(adventure.title)
  const [description, setDescription] = useState(adventure.description ?? '')
  const [audience, setAudience] = useState(adventure.audience ?? 'all')
  const [tags, setTags] = useState<string[]>(() => {
    try { return JSON.parse(adventure.tags ?? '[]') } catch { return [] }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/adventures/${adventure.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), audience, tags }),
      })
      if (!res.ok) throw new Error('Failed to save')
      analytics.adventureSettingsSaved(adventure.id, audience)
      onSave({ title: title.trim(), description: description.trim(), audience, tags: JSON.stringify(tags) })
      onClose()
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Story Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Story title"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="A short description of your story…"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Tags
            {tags.length > 0 && (
              <span className="ml-2 text-xs font-normal text-amber-600">{tags.length} selected</span>
            )}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STORY_TAGS.map(tag => {
              const selected = tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selected
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400 hover:text-amber-600'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-400">Select all that apply</p>
        </div>

        {/* Audience */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Audience</label>
          <div className="flex flex-col gap-2">
            {AUDIENCE_OPTIONS.map(opt => (
              <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${audience === opt.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="audience"
                  value={opt.value}
                  checked={audience === opt.value}
                  onChange={() => setAudience(opt.value)}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
