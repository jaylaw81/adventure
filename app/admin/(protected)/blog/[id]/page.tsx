'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, Eye, ImagePlus, X, Upload, Search, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogSection, BlogSectionImage, BlogCategory } from '@/lib/blogPosts'
import type { UnsplashPhoto } from '@/app/api/admin/blog/unsplash/route'

const CATEGORIES: BlogCategory[] = ['Writing Tips', 'Interactive Fiction', 'Story Ideas', 'History', 'Education']

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Image upload hook ───────────────────────────────────
function useImageUpload() {
  const [uploading, setUploading] = useState(false)

  async function upload(file: File): Promise<string | null> {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Upload failed'); return null }
      return data.url as string
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}

// ── Drop-zone component ─────────────────────────────────
function ImageDropZone({
  value,
  onChange,
  label = 'Upload image',
  aspectHint,
}: {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  aspectHint?: string
}) {
  const { upload, uploading } = useImageUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    const url = await upload(file)
    if (url) onChange(url)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <div className="relative w-full" style={{ aspectRatio: aspectHint === 'hero' ? '16/7' : '16/9' }}>
          <Image src={value} alt="Uploaded" fill className="object-cover" unoptimized />
        </div>
        <button
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
          title="Remove image"
        >
          <X size={14} />
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors"
        >
          <Upload size={11} /> Replace
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>
    )
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
        dragging ? 'border-violet-400 bg-violet-50' : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/50'
      }`}
      style={{ minHeight: aspectHint === 'hero' ? '140px' : '100px' }}
    >
      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          Uploading…
        </div>
      ) : (
        <>
          <ImagePlus size={20} className="text-gray-400" />
          <span className="text-sm text-gray-500">{label}</span>
          {aspectHint && <span className="text-xs text-gray-400">Drag & drop or click to browse</span>}
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

// ── Unsplash picker ─────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string> = {
  'Writing Tips': 'writing storytelling books author',
  'Interactive Fiction': 'reading library books imagination',
  'Story Ideas': 'creativity ideas inspiration notebook',
  'History': 'vintage history old books typewriter',
  'Education': 'classroom education learning school',
}

function UnsplashPicker({
  category,
  titleHint,
  onSelect,
}: {
  category: BlogCategory
  titleHint: string
  onSelect: (photo: UnsplashPhoto) => void
}) {
  const defaultQuery = titleHint.split(' ').slice(0, 3).join(' ') || CATEGORY_KEYWORDS[category] || 'writing books'
  const [query, setQuery] = useState(defaultQuery)
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function search(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await fetch(`/api/admin/blog/unsplash?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Search failed'); return }
      setPhotos(data.photos ?? [])
    } finally {
      setLoading(false)
    }
  }

  // Auto-search on mount
  useEffect(() => { search(defaultQuery) }, []) // eslint-disable-line

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query)}
          placeholder="Search Unsplash…"
        />
        <button
          onClick={() => search(query)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Search size={13} /> Search
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-video rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && searched && photos.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-center py-4">No results found.</p>
      )}

      {!loading && photos.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <button
                key={photo.id}
                onClick={() => onSelect(photo)}
                className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-violet-400 transition-all"
              >
                <Image src={photo.thumb} alt={photo.alt || 'Unsplash photo'} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] truncate">{photo.authorName}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right">
            Photos from{' '}
            <a href="https://unsplash.com?utm_source=storyquestor&utm_medium=referral" target="_blank" rel="noopener noreferrer"
              className="underline hover:text-gray-600">Unsplash</a>
          </p>
        </>
      )}
    </div>
  )
}

// ── Hero image panel ─────────────────────────────────────
interface HeroCredit { authorName: string; authorUrl: string }

function HeroImagePanel({
  value,
  credit,
  category,
  titleHint,
  onChange,
}: {
  value: string | null
  credit: HeroCredit | null
  category: BlogCategory
  titleHint: string
  onChange: (url: string | null, credit: HeroCredit | null) => void
}) {
  const [tab, setTab] = useState<'upload' | 'unsplash'>('unsplash')

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-gray-100 w-fit">
        {(['unsplash', 'upload'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'unsplash' ? 'Unsplash' : 'Upload'}
          </button>
        ))}
      </div>

      {/* Current image preview (shown regardless of tab) */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <div className="relative w-full" style={{ aspectRatio: '16/7' }}>
            <Image src={value} alt="Hero" fill className="object-cover" unoptimized />
          </div>
          <button onClick={() => onChange(null, null)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors">
            <X size={14} />
          </button>
          {credit && (
            <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1">
              Photo by{' '}
              <a href={credit.authorUrl} target="_blank" rel="noopener noreferrer"
                className="font-medium text-gray-700 hover:underline flex items-center gap-0.5">
                {credit.authorName} <ExternalLink size={9} />
              </a>
              {' '}on{' '}
              <a href="https://unsplash.com?utm_source=storyquestor&utm_medium=referral"
                target="_blank" rel="noopener noreferrer" className="font-medium text-gray-700 hover:underline">
                Unsplash
              </a>
            </div>
          )}
        </div>
      )}

      {/* Unsplash tab */}
      {tab === 'unsplash' && (
        <UnsplashPicker
          category={category}
          titleHint={titleHint}
          onSelect={photo => onChange(photo.regular, { authorName: photo.authorName, authorUrl: photo.authorUrl })}
        />
      )}

      {/* Upload tab */}
      {tab === 'upload' && !value && (
        <ImageDropZone
          value={null}
          onChange={url => onChange(url, null)}
          label="Upload hero image"
          aspectHint="hero"
        />
      )}
    </div>
  )
}

// ── Inline image row ────────────────────────────────────
function InlineImageRow({
  img,
  paragraphCount,
  onChange,
  onRemove,
}: {
  img: BlogSectionImage
  paragraphCount: number
  onChange: (patch: Partial<BlogSectionImage>) => void
  onRemove: () => void
}) {
  const { upload, uploading } = useImageUpload()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    const url = await upload(file)
    if (url) onChange({ url })
  }

  const positions = [
    { value: -1, label: 'Before all paragraphs' },
    ...Array.from({ length: paragraphCount }, (_, i) => ({
      value: i,
      label: `After paragraph ${i + 1}`,
    })),
  ]

  return (
    <div className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 border border-gray-200">
      {/* Thumbnail / upload */}
      <div className="shrink-0 w-24">
        {img.url ? (
          <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image src={img.url} alt="Inline" fill className="object-cover" unoptimized />
            <button onClick={() => onChange({ url: '' })}
              className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-white hover:bg-black/80">
              <X size={10} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white cursor-pointer hover:border-violet-300 transition-colors"
            style={{ aspectRatio: '16/9' }}
          >
            {uploading
              ? <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              : <ImagePlus size={14} className="text-gray-400" />}
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-0.5">Position</label>
          <select
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={img.afterParagraphIndex}
            onChange={e => onChange({ afterParagraphIndex: Number(e.target.value) })}
          >
            {positions.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <input
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={img.caption ?? ''}
          onChange={e => onChange({ caption: e.target.value })}
          placeholder="Caption (optional)"
        />
      </div>

      <button onClick={onRemove}
        className="shrink-0 mt-1 p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────

interface FormState {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
  category: BlogCategory
  heroImageUrl: string | null
  heroImageCredit: HeroCredit | null
  intro: string
  sections: BlogSection[]
  published: boolean
}

const EMPTY: FormState = {
  slug: '',
  title: '',
  description: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  readingMinutes: 5,
  category: 'Writing Tips',
  heroImageUrl: null,
  heroImageCredit: null,
  intro: '',
  sections: [{ heading: '', paragraphs: [''], list: [], images: [] }],
  published: true,
}

export default function BlogEditorPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const isNew = params.id === 'new'

  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/blog/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          slug: data.slug,
          title: data.title,
          description: data.description,
          publishedAt: data.publishedAt,
          readingMinutes: data.readingMinutes,
          category: data.category as BlogCategory,
          heroImageUrl: data.heroImageUrl ?? null,
          heroImageCredit: data.heroImageCredit ? JSON.parse(data.heroImageCredit) : null,
          intro: data.intro,
          sections: (data.sections as BlogSection[]).map(s => ({
            heading: s.heading ?? '',
            paragraphs: s.paragraphs.length ? s.paragraphs : [''],
            list: s.list ?? [],
            images: s.images ?? [],
          })),
          published: data.published,
        })
        setSlugManual(true)
        setLoading(false)
      })
  }, [isNew, params.id])

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  function handleTitleChange(v: string) {
    set('title', v)
    if (!slugManual) set('slug', slugify(v))
  }

  // ── Section helpers ────────────────────────────────────
  function addSection() {
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, { heading: '', paragraphs: [''], list: [], images: [] }],
    }))
  }

  function removeSection(i: number) {
    setForm(prev => ({ ...prev, sections: prev.sections.filter((_, j) => j !== i) }))
  }

  function moveSection(i: number, dir: -1 | 1) {
    setForm(prev => {
      const s = [...prev.sections]
      const j = i + dir
      if (j < 0 || j >= s.length) return prev;
      [s[i], s[j]] = [s[j], s[i]]
      return { ...prev, sections: s }
    })
  }

  function updateSection(i: number, patch: Partial<BlogSection>) {
    setForm(prev => {
      const s = [...prev.sections]
      s[i] = { ...s[i], ...patch }
      return { ...prev, sections: s }
    })
  }

  function addParagraph(si: number) {
    setForm(prev => {
      const s = [...prev.sections]
      s[si] = { ...s[si], paragraphs: [...s[si].paragraphs, ''] }
      return { ...prev, sections: s }
    })
  }

  function removeParagraph(si: number, pi: number) {
    setForm(prev => {
      const s = [...prev.sections]
      const paras = s[si].paragraphs.filter((_, j) => j !== pi)
      s[si] = { ...s[si], paragraphs: paras.length ? paras : [''] }
      return { ...prev, sections: s }
    })
  }

  function updateParagraph(si: number, pi: number, v: string) {
    setForm(prev => {
      const s = [...prev.sections]
      const p = [...s[si].paragraphs]
      p[pi] = v
      s[si] = { ...s[si], paragraphs: p }
      return { ...prev, sections: s }
    })
  }

  function addListItem(si: number) {
    setForm(prev => {
      const s = [...prev.sections]
      s[si] = { ...s[si], list: [...(s[si].list ?? []), { item: '', detail: '' }] }
      return { ...prev, sections: s }
    })
  }

  function removeListItem(si: number, li: number) {
    setForm(prev => {
      const s = [...prev.sections]
      s[si] = { ...s[si], list: (s[si].list ?? []).filter((_, j) => j !== li) }
      return { ...prev, sections: s }
    })
  }

  function updateListItem(si: number, li: number, field: 'item' | 'detail', v: string) {
    setForm(prev => {
      const s = [...prev.sections]
      const list = [...(s[si].list ?? [])]
      list[li] = { ...list[li], [field]: v }
      s[si] = { ...s[si], list }
      return { ...prev, sections: s }
    })
  }

  function addSectionImage(si: number) {
    setForm(prev => {
      const s = [...prev.sections]
      const newImg: BlogSectionImage = { url: '', afterParagraphIndex: s[si].paragraphs.length - 1, caption: '' }
      s[si] = { ...s[si], images: [...(s[si].images ?? []), newImg] }
      return { ...prev, sections: s }
    })
  }

  function updateSectionImage(si: number, ii: number, patch: Partial<BlogSectionImage>) {
    setForm(prev => {
      const s = [...prev.sections]
      const imgs = [...(s[si].images ?? [])]
      imgs[ii] = { ...imgs[ii], ...patch }
      s[si] = { ...s[si], images: imgs }
      return { ...prev, sections: s }
    })
  }

  function removeSectionImage(si: number, ii: number) {
    setForm(prev => {
      const s = [...prev.sections]
      s[si] = { ...s[si], images: (s[si].images ?? []).filter((_, j) => j !== ii) }
      return { ...prev, sections: s }
    })
  }

  // ── Save ──────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      heroImageUrl: form.heroImageUrl || null,
      heroImageCredit: form.heroImageCredit ? JSON.stringify(form.heroImageCredit) : null,
      sections: form.sections.map(s => ({
        heading: s.heading || undefined,
        paragraphs: s.paragraphs.filter(p => p.trim()),
        list: (s.list ?? []).filter(l => l.item.trim()).map(l => ({
          item: l.item,
          detail: l.detail || undefined,
        })),
        images: (s.images ?? []).filter(img => img.url).map(img => ({
          url: img.url,
          alt: img.alt || undefined,
          caption: img.caption || undefined,
          afterParagraphIndex: img.afterParagraphIndex,
        })),
      })).filter(s => s.paragraphs.length > 0),
    }

    const url = isNew ? '/api/admin/blog' : `/api/admin/blog/${params.id}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Failed to save')
      setSaving(false)
      return
    }

    const saved = await res.json()
    if (isNew) router.replace(`/admin/blog/${saved.id}`)
    else setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    )
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all'
  const textareaCls = `${inputCls} resize-y`
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1'

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/admin/blog" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={15} /> All posts
        </Link>
        <div className="flex items-center gap-2">
          {!isNew && form.published && (
            <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:border-gray-400 transition-colors">
              <Eye size={14} /> Preview
            </a>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            <Save size={14} />
            {saving ? 'Saving…' : isNew ? 'Create post' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Meta fields */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Post details</h2>

        <div>
          <label className={labelCls}>Title *</label>
          <input className={inputCls} value={form.title} onChange={e => handleTitleChange(e.target.value)}
            placeholder="How to Write a Branching Story…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Slug *</label>
            <input className={`${inputCls} font-mono`} value={form.slug}
              onChange={e => { setSlugManual(true); set('slug', slugify(e.target.value)) }}
              placeholder="how-to-write-branching-story" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category}
              onChange={e => set('category', e.target.value as BlogCategory)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea className={textareaCls} rows={2} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="A short summary of what this post covers…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Published date</label>
            <input type="date" className={inputCls} value={form.publishedAt}
              onChange={e => set('publishedAt', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Reading time (minutes)</label>
            <input type="number" className={inputCls} min={1} max={60} value={form.readingMinutes}
              onChange={e => set('readingMinutes', Number(e.target.value))} />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => set('published', !form.published)}
            className={`relative w-10 rounded-full transition-colors ${form.published ? 'bg-violet-600' : 'bg-gray-200'}`}
            style={{ height: '22px' }}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.published ? 'left-5' : 'left-0.5'}`} />
          </button>
          <span className="text-sm text-gray-700">{form.published ? 'Published' : 'Draft'}</span>
        </div>
      </div>

      {/* Hero image */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-1">Hero image</label>
        <p className="text-xs text-gray-400 mb-3">
          Search Unsplash for a free photo, or upload your own. Recommended: 1200×500px or wider.
        </p>
        <HeroImagePanel
          value={form.heroImageUrl}
          credit={form.heroImageCredit}
          category={form.category}
          titleHint={form.title}
          onChange={(url, credit) => setForm(prev => ({ ...prev, heroImageUrl: url, heroImageCredit: credit }))}
        />
      </div>

      {/* Intro */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Introduction</label>
        <textarea className={textareaCls} rows={5} value={form.intro}
          onChange={e => set('intro', e.target.value)}
          placeholder="Opening paragraph shown at the top of the article…" />
      </div>

      {/* Sections */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Sections</h2>
          <button onClick={addSection}
            className="flex items-center gap-1 text-sm text-violet-600 font-semibold hover:text-violet-800 transition-colors">
            <Plus size={14} /> Add section
          </button>
        </div>

        {form.sections.map((section, si) => (
          <div key={si} className="bg-white rounded-2xl border border-gray-200 p-5">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-gray-400 mr-auto">Section {si + 1}</span>
              <button onClick={() => moveSection(si, -1)} disabled={si === 0}
                className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 transition-colors">
                <ChevronUp size={14} />
              </button>
              <button onClick={() => moveSection(si, 1)} disabled={si === form.sections.length - 1}
                className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 transition-colors">
                <ChevronDown size={14} />
              </button>
              <button onClick={() => removeSection(si)} disabled={form.sections.length === 1}
                className="p-1 rounded text-red-400 hover:text-red-600 disabled:opacity-25 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Heading */}
            <div className="mb-4">
              <label className={labelCls}>Section heading (optional)</label>
              <input className={inputCls} value={section.heading ?? ''}
                onChange={e => updateSection(si, { heading: e.target.value })}
                placeholder="Leave blank for a headingless section" />
            </div>

            {/* Paragraphs */}
            <div className="mb-4">
              <label className={labelCls}>Paragraphs</label>
              <div className="space-y-2">
                {section.paragraphs.map((p, pi) => (
                  <div key={pi} className="flex gap-2">
                    <textarea className={`${textareaCls} flex-1`} rows={3} value={p}
                      onChange={e => updateParagraph(si, pi, e.target.value)}
                      placeholder={`Paragraph ${pi + 1}…`} />
                    <button onClick={() => removeParagraph(si, pi)} disabled={section.paragraphs.length === 1}
                      className="self-start p-1.5 rounded text-gray-400 hover:text-red-600 disabled:opacity-20 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addParagraph(si)}
                className="mt-2 text-xs text-violet-600 font-semibold hover:text-violet-800 transition-colors">
                + Add paragraph
              </button>
            </div>

            {/* Inline images */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className={`${labelCls} mb-0`}>Inline images</label>
                <button onClick={() => addSectionImage(si)}
                  className="flex items-center gap-1 text-xs text-violet-600 font-semibold hover:text-violet-800 transition-colors">
                  <ImagePlus size={12} /> Add image
                </button>
              </div>
              {(section.images ?? []).length > 0 && (
                <div className="space-y-2 mt-1">
                  {(section.images ?? []).map((img, ii) => (
                    <InlineImageRow
                      key={ii}
                      img={img}
                      paragraphCount={section.paragraphs.length}
                      onChange={patch => updateSectionImage(si, ii, patch)}
                      onRemove={() => removeSectionImage(si, ii)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* List items */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${labelCls} mb-0`}>List items (optional)</label>
                <button onClick={() => addListItem(si)}
                  className="text-xs text-violet-600 font-semibold hover:text-violet-800 transition-colors">
                  + Add item
                </button>
              </div>
              {(section.list ?? []).length > 0 && (
                <div className="space-y-2 mt-2">
                  {(section.list ?? []).map((li, lii) => (
                    <div key={lii} className="flex gap-2">
                      <input className={`${inputCls} w-36 shrink-0`} value={li.item}
                        onChange={e => updateListItem(si, lii, 'item', e.target.value)} placeholder="Term" />
                      <input className={`${inputCls} flex-1`} value={li.detail ?? ''}
                        onChange={e => updateListItem(si, lii, 'detail', e.target.value)}
                        placeholder="Detail / explanation (optional)" />
                      <button onClick={() => removeListItem(si, lii)}
                        className="self-start p-1.5 rounded text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating save */}
      <div className="fixed bottom-6 right-6">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          <Save size={15} />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

    </div>
  )
}
