'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Globe, Lock, EyeOff } from 'lucide-react'

type PrivacyLevel = 'public' | 'org-only' | 'private'

const PRIVACY_OPTIONS: { value: PrivacyLevel; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'public',
    label: 'Public',
    desc: 'Anyone can discover and read your organization\'s published stories.',
    icon: <Globe size={16} className="text-green-500" />,
  },
  {
    value: 'org-only',
    label: 'Organization members only',
    desc: 'Only members of your organization can view stories. Default for most schools.',
    icon: <Lock size={16} className="text-amber-500" />,
  },
  {
    value: 'private',
    label: 'Private',
    desc: 'All content is private. Stories are only visible to their authors.',
    icon: <EyeOff size={16} className="text-slate-400" />,
  },
]

export default function OrgSettingsPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('org-only')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/org')
      .then(r => r.json())
      .then(data => {
        setName(data.org?.name ?? '')
        setDescription(data.org?.description ?? '')
        setPrivacyLevel((data.org?.privacyLevel ?? 'org-only') as PrivacyLevel)
        setLoading(false)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/org/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, privacyLevel }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your organization's profile and access controls</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">Profile</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Organization name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={200}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Lincoln Elementary School"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              placeholder="A brief description of your school or classroom…"
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-700">Organization Privacy</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sets the default visibility for all content in your organization. Individual groups can override this.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {PRIVACY_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  privacyLevel === opt.value
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="privacyLevel"
                  value={opt.value}
                  checked={privacyLevel === opt.value}
                  onChange={() => setPrivacyLevel(opt.value)}
                  className="mt-0.5 accent-amber-500"
                />
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5">{opt.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-50 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
