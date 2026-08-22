'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { X, GitBranch, Layers, Swords, MapPin, Globe, Link2, Copy, Check as CheckIcon, RefreshCw, BookImage, Sparkles } from 'lucide-react'
import type { AdventureWithCounts } from '@/lib/queries'
import { analytics } from '@/lib/analytics'
import { STORY_TAGS } from '@/lib/tags'
import { LANGUAGES } from '@/lib/languages'
import { titleToSlug } from '@/lib/slugUtils'
import PhotoSourcePicker from '@/components/editor/PhotoSourcePicker'

interface Props {
  adventure: AdventureWithCounts
  onClose: () => void
  onSave: (updated: Partial<AdventureWithCounts>) => void
  canUseCustomSlug?: boolean
}

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Ages', description: 'Family-friendly, suitable for everyone' },
  { value: 'teens', label: 'Teens', description: 'Appropriate for teenagers, no adult content' },
  { value: 'adults', label: 'Adults Only', description: 'Mature themes, adults only' },
]

export default function AdventureSettingsModal({ adventure, onClose, onSave, canUseCustomSlug = false }: Props) {
  const { data: session } = useSession()
  const isOrgTier = session?.user?.tier === 'organization'
  const canUseMedia = isOrgTier || session?.user?.subscriptionInterval === 'month' || session?.user?.isAdmin || session?.user?.grandfathered

  const [title, setTitle] = useState(adventure.title)
  const [description, setDescription] = useState(adventure.description ?? '')
  const [audience, setAudience] = useState(adventure.audience ?? 'all')
  const [tags, setTags] = useState<string[]>(() => {
    try { return JSON.parse(adventure.tags ?? '[]') } catch { return [] }
  })
  const [editorMode, setEditorMode] = useState<'node' | 'block'>(
    (adventure as { editorMode?: string }).editorMode === 'block' ? 'block' : 'node'
  )
  const isStorybook = (adventure as { storyType?: string | null }).storyType === 'storybook'
  const [storyType, setStoryType] = useState<'path' | 'world'>(
    (adventure as { storyType?: string | null }).storyType === 'world' ? 'world' : 'path'
  )
  const [language, setLanguage] = useState<string>(
    (adventure as { language?: string | null }).language ?? 'en'
  )
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    (adventure as { coverImageUrl?: string | null }).coverImageUrl ?? null
  )
  const [generatingCover, setGeneratingCover] = useState(false)
  const [coverRegenCount, setCoverRegenCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slug, setSlug] = useState<string | null>((adventure as { storySlug?: string | null }).storySlug ?? null)
  const [generatingSlug, setGeneratingSlug] = useState(false)
  const [slugCopied, setSlugCopied] = useState(false)
  const [slugError, setSlugError] = useState('')

  async function handleGenerateCover(isRegen: boolean) {
    setGeneratingCover(true)
    if (isRegen) setCoverRegenCount(c => c + 1)
    try {
      const res = await fetch(`/api/adventures/${adventure.id}/cover`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json() as { coverImageUrl: string | null }
        setCoverImageUrl(updated.coverImageUrl ?? null)
        onSave({ coverImageUrl: updated.coverImageUrl } as Partial<AdventureWithCounts>)
      }
    } finally {
      setGeneratingCover(false)
    }
  }

  async function handleCoverReady(dataUrl: string) {
    setGeneratingCover(true)
    try {
      const source = dataUrl.startsWith('data:image/png') ? 'draw' : 'upload'
      const res = await fetch(`/api/adventures/${adventure.id}/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, dataUrl }),
      })
      if (res.ok) {
        const updated = await res.json() as { coverImageUrl: string | null }
        setCoverImageUrl(updated.coverImageUrl ?? null)
        onSave({ coverImageUrl: updated.coverImageUrl } as Partial<AdventureWithCounts>)
      }
    } finally {
      setGeneratingCover(false)
    }
  }

  async function handleRemoveCover() {
    await fetch(`/api/adventures/${adventure.id}/cover`, { method: 'DELETE' })
    setCoverImageUrl(null)
    onSave({ coverImageUrl: null } as Partial<AdventureWithCounts>)
  }

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleGenerateSlug = async () => {
    setGeneratingSlug(true)
    setSlugError('')
    try {
      const res = await fetch(`/api/adventures/${adventure.id}/slug`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to generate URL')
      const data = await res.json() as { slug: string }
      setSlug(data.slug)
    } catch {
      setSlugError('Failed to generate custom URL')
    } finally {
      setGeneratingSlug(false)
    }
  }

  const handleCopySlug = async () => {
    if (!slug) return
    await navigator.clipboard.writeText(`https://www.storyquestor.com/story/${slug}`)
    setSlugCopied(true)
    setTimeout(() => setSlugCopied(false), 2000)
  }

  const originalStoryType = (adventure as { storyType?: string | null }).storyType === 'world' ? 'world' : 'path'
  const storyTypeChanged = !isStorybook && storyType !== originalStoryType

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/adventures/${adventure.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          audience,
          tags,
          editorMode: isStorybook ? 'block' : editorMode,
          storyType: isStorybook ? 'storybook' : storyType,
          language,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      analytics.adventureSettingsSaved(adventure.id, audience)
      onSave({ title: title.trim(), description: description.trim(), audience, tags: JSON.stringify(tags), editorMode } as Partial<AdventureWithCounts>)
      if (storyTypeChanged) {
        window.location.reload()
      } else {
        onClose()
      }
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">
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

        {/* Story Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Story Mode</label>
          {isStorybook ? (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-teal-300 bg-teal-50">
              <BookImage size={15} className="mt-0.5 shrink-0 text-teal-600" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Storybook</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">Illustrated page-by-page reading, image on one side and text on the other</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'path' as const, label: 'Story Path', description: 'Linear or branching narrative with choices', icon: MapPin },
                { value: 'world' as const, label: 'World Builder', description: 'Tracks character stats that change with choices', icon: Swords },
              ].map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStoryType(value)}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                    storyType === value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={15} className={`mt-0.5 shrink-0 ${storyType === value ? 'text-amber-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500 leading-tight mt-0.5">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {storyTypeChanged && (
            <p className="text-xs text-amber-600">
              Changing story mode will reload the page after saving. All story data is preserved.
            </p>
          )}
        </div>

        {/* Cover Image — Storybook only */}
        {isStorybook && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Cover Image</label>
            {!canUseMedia ? (
              <div className="w-full flex items-center gap-2.5 py-3 px-3.5 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-400">
                <Sparkles size={13} className="shrink-0 text-gray-300" />
                Cover art is available on the monthly plan
              </div>
            ) : (
              <div className="max-w-[220px]">
                <PhotoSourcePicker
                  imageUrl={coverImageUrl}
                  aspect="portrait"
                  generating={generatingCover}
                  canGenerate
                  regenCount={coverRegenCount}
                  onGenerate={handleGenerateCover}
                  onImageReady={handleCoverReady}
                  onRemove={handleRemoveCover}
                />
              </div>
            )}
            <p className="text-xs text-gray-400">Shown on your story's landing page, like a book cover</p>
          </div>
        )}

        {/* Editor Style — storybook is always Block Builder, since its linear page flow has no use for a freeform canvas */}
        {!isStorybook && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Editor Style</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'node' as const, label: 'Node Graph', description: 'Freeform canvas with drag connectors', icon: GitBranch },
                { value: 'block' as const, label: 'Block Builder', description: 'Stacked blocks, Scratch-inspired', icon: Layers },
              ].map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEditorMode(value)}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                    editorMode === value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={15} className={`mt-0.5 shrink-0 ${editorMode === value ? 'text-amber-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500 leading-tight mt-0.5">{description}</p>
                  </div>
                </button>
              ))}
            </div>
            {editorMode !== ((adventure as { editorMode?: string }).editorMode === 'block' ? 'block' : 'node') && (
              <p className="text-xs text-amber-600">
                Switching editor styles will reload the page after saving. All story data is preserved.
              </p>
            )}
          </div>
        )}

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

        {/* Story Language */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Globe size={14} className="text-gray-400" />
            Story Language
          </label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name} — {lang.nativeName}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">Helps readers find and translate your story</p>
        </div>

        {/* Custom Story URL — monthly subscribers only */}
        {canUseCustomSlug && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Link2 size={14} className="text-gray-400" />
              Custom Story URL
            </label>
            {slug ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                  <span className="text-xs text-violet-700 truncate flex-1 font-mono">
                    storyquestor.com/story/{slug}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySlug}
                    className="shrink-0 flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900 transition-colors"
                  >
                    {slugCopied ? <CheckIcon size={12} /> : <Copy size={12} />}
                    {slugCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  disabled={generatingSlug}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 w-fit"
                >
                  <RefreshCw size={11} className={generatingSlug ? 'animate-spin' : ''} />
                  {generatingSlug ? 'Regenerating…' : 'Regenerate from title'}
                </button>
                <p className="text-xs text-amber-600">Regenerating will break any existing links to the old URL.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-400 flex-1 font-mono">
                    storyquestor.com/story/{titleToSlug(title || adventure.title)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  disabled={generatingSlug}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 w-fit"
                >
                  <Link2 size={12} />
                  {generatingSlug ? 'Generating…' : 'Generate Custom URL'}
                </button>
                <p className="text-xs text-gray-400">Creates a memorable link for sharing your story.</p>
              </div>
            )}
            {slugError && <p className="text-xs text-red-500">{slugError}</p>}
          </div>
        )}

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
