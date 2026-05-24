'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Play, Pause, X, Music, Volume2, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

interface SoundResult {
  id: number
  name: string
  username: string
  license: string
  previewUrl: string
  duration: number
  tags: string[]
}

interface Props {
  currentSoundUrl: string | null
  currentSoundTitle: string | null
  onSelect: (soundUrl: string, soundTitle: string) => void
  onRemove: () => void
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'ambient', label: 'Ambient' },
  { id: 'effects', label: 'Effects' },
] as const

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function LicenseBadge({ license }: { license: string }) {
  const colors: Record<string, string> = {
    CC0: 'bg-emerald-100 text-emerald-700',
    'CC BY': 'bg-blue-100 text-blue-700',
    'CC BY-NC': 'bg-amber-100 text-amber-700',
    'CC BY-ND': 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[license] ?? 'bg-gray-100 text-gray-600'}`}>
      {license}
    </span>
  )
}

export default function SoundPicker({ currentSoundUrl, currentSoundTitle, onSelect, onRemove }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [results, setResults] = useState<SoundResult[]>([])
  const [loading, setLoading] = useState(false)
  const [unconfigured, setUnconfigured] = useState(false)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stop audio when picker closes
  useEffect(() => {
    if (!open) stopAudio()
  }, [open])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const search = useCallback(async (q: string, cat: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/sounds/search?q=${encodeURIComponent(q)}&category=${cat}`)
      const data = await res.json()
      if (data.unconfigured) { setUnconfigured(true); setResults([]); return }
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val, category), 500)
  }

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    if (query.trim()) search(query, cat)
  }

  const stopAudio = () => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.src = ''
    setPlayingId(null)
    setLoadingId(null)
  }

  const togglePreview = (sound: SoundResult) => {
    if (playingId === sound.id) {
      stopAudio()
      return
    }
    stopAudio()
    setLoadingId(sound.id)
    const audio = new Audio(sound.previewUrl)
    audioRef.current = audio
    audio.volume = 0.6
    audio.oncanplay = () => {
      audio.play().catch(() => {})
      setPlayingId(sound.id)
      setLoadingId(null)
    }
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => { setPlayingId(null); setLoadingId(null) }
    audio.load()
  }

  const handleSelect = (sound: SoundResult) => {
    const attribution = `${sound.name} by ${sound.username} · ${sound.license}`
    onSelect(sound.previewUrl, attribution)
    stopAudio()
    setOpen(false)
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">Scene Sound</label>

      {/* Current sound */}
      {currentSoundUrl && currentSoundTitle ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-50 border border-violet-200 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
            <Music size={12} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-violet-900 truncate leading-tight">
              {currentSoundTitle.split(' by ')[0]}
            </p>
            <p className="text-[10px] text-violet-500 truncate">
              {currentSoundTitle.split(' by ').slice(1).join(' by ')}
            </p>
          </div>
          <button
            onClick={onRemove}
            className="shrink-0 p-1 rounded-lg text-violet-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove sound"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}

      {/* Open/change button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-colors"
      >
        <Music size={13} />
        {currentSoundUrl ? 'Change sound' : 'Add scene sound'}
      </button>

      {/* Picker panel */}
      {open && (
        <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
          {/* Search bar */}
          <div className="p-2.5 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search sounds…"
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="flex gap-1 mt-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    category === c.id
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-56 overflow-y-auto">
            {unconfigured ? (
              <div className="p-4 text-center">
                <AlertCircle size={18} className="text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700 mb-1">Freesound not configured</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Add <code className="bg-gray-100 px-1 rounded">FREESOUND_API_KEY</code> to <code className="bg-gray-100 px-1 rounded">.env.local</code>.
                  Get a free key at{' '}
                  <a href="https://freesound.org/apiv2/apply" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">
                    freesound.org
                  </a>
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
                <Loader2 size={13} className="animate-spin" />
                Searching…
              </div>
            ) : !query.trim() ? (
              <div className="py-6 text-center text-xs text-gray-400">
                <Volume2 size={18} className="mx-auto mb-1.5 text-gray-300" />
                Search for ambient sounds, music loops, or effects
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">No results found</div>
            ) : (
              results.map(sound => (
                <div
                  key={sound.id}
                  className={`flex items-center gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-violet-50/40 transition-colors ${
                    currentSoundUrl === sound.previewUrl ? 'bg-violet-50' : ''
                  }`}
                >
                  {/* Play/pause */}
                  <button
                    onClick={() => togglePreview(sound)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      background: playingId === sound.id
                        ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
                        : '#f3f4f6',
                    }}
                  >
                    {loadingId === sound.id ? (
                      <Loader2 size={11} className="text-violet-600 animate-spin" />
                    ) : playingId === sound.id ? (
                      <Pause size={11} className="text-white" />
                    ) : (
                      <Play size={11} className="text-gray-500" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{sound.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400">{formatDuration(sound.duration)}</span>
                      <span className="text-gray-200">·</span>
                      <LicenseBadge license={sound.license} />
                      <span className="text-[10px] text-gray-400 truncate">{sound.username}</span>
                    </div>
                  </div>

                  {/* Select */}
                  {currentSoundUrl === sound.previewUrl ? (
                    <span className="text-[10px] font-bold text-violet-600 shrink-0">✓ Added</span>
                  ) : (
                    <button
                      onClick={() => handleSelect(sound)}
                      className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                    >
                      Use
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">Sounds from Freesound.org · CC licensed</p>
              <a
                href={`https://freesound.org/search/?q=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700"
              >
                <ExternalLink size={10} />
                Open Freesound
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
