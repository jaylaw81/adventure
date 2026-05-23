'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, LayoutTemplate, AlignLeft, BookMarked, Check } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import PageBanner from '@/components/shared/PageBanner'

type Mode = 'template' | 'blank'
type TemplateSize = 'small' | 'medium' | 'large'
type Step = 'mode' | 'size' | 'chapters' | 'details'

const SIZE_INFO = {
  small: {
    label: 'Small',
    subtitle: 'Short story',
    description: 'A focused two-path narrative with a clear beginning and two distinct endings.',
    nodes: '5 scenes',
    choices: '4 choices',
  },
  medium: {
    label: 'Medium',
    subtitle: '4–10 choices',
    description: 'A branching adventure with multiple paths, some dead ends, and four possible outcomes.',
    nodes: '9 scenes',
    choices: '8 choices',
  },
  large: {
    label: 'Large',
    subtitle: '11+ choices',
    description: 'An epic multi-path story with three main branches, deep decision trees, and six unique endings.',
    nodes: '16 scenes',
    choices: '15 choices',
  },
} as const

const STEP_LABELS: Record<Step, string> = {
  mode: 'Start type',
  size: 'Story size',
  chapters: 'Chapters',
  details: 'Details',
}

function StepDots({ current }: { current: Step }) {
  const steps: Step[] = ['mode', 'size', 'chapters', 'details']
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            s === current ? 'text-violet-700' : steps.indexOf(current) > i ? 'text-violet-400' : 'text-gray-300'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s === current
                ? 'bg-violet-600 text-white'
                : steps.indexOf(current) > i
                  ? 'bg-violet-200 text-violet-600'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {steps.indexOf(current) > i ? <Check size={10} /> : i + 1}
            </div>
            <span className="hidden sm:block">{STEP_LABELS[s]}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-6 transition-colors ${steps.indexOf(current) > i ? 'bg-violet-300' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('mode')
  const [mode, setMode] = useState<Mode | null>(null)
  const [templateSize, setTemplateSize] = useState<TemplateSize | null>(null)
  const [wantChapters, setWantChapters] = useState(false)
  const [chapterCount, setChapterCount] = useState(2)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function goBack() {
    if (step === 'size') setStep('mode')
    else if (step === 'chapters') setStep('size')
    else if (step === 'details') setStep(mode === 'template' ? 'chapters' : 'mode')
  }

  async function handleCreate() {
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
      }
      if (mode === 'template' && templateSize) {
        body.template = templateSize
        body.chapterCount = wantChapters ? chapterCount : 0
      }
      const res = await fetch('/api/adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
        subtitle="Set up your adventure before you start writing"
        action={
          step === 'mode' ? (
            <Link href="/" className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
              <ArrowLeft size={15} /> Back
            </Link>
          ) : (
            <button onClick={goBack} className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
          )
        }
      />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <StepDots current={step} />

        {/* ── Step 1: Mode ── */}
        {step === 'mode' && (
          <div>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1e0a3c' }}>How would you like to start?</h2>
            <p className="text-sm text-gray-500 text-center mb-8">Templates give you a ready-made story structure to fill in.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setMode('template'); setStep('size') }}
                className="group text-left p-6 bg-white rounded-2xl border-2 border-violet-200 hover:border-violet-500 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                  <LayoutTemplate size={20} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-base mb-1" style={{ color: '#1e0a3c' }}>Start from a template</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Choose a story size and get a pre-built scene structure to fill in.</p>
              </button>

              <button
                onClick={() => { setMode('blank'); setStep('details') }}
                className="group text-left p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-400 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                  <AlignLeft size={20} className="text-gray-600" />
                </div>
                <h3 className="font-bold text-base mb-1" style={{ color: '#1e0a3c' }}>Blank editor</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Start with a single scene and build your story from scratch.</p>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Size ── */}
        {step === 'size' && (
          <div>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1e0a3c' }}>Choose a story size</h2>
            <p className="text-sm text-gray-500 text-center mb-8">Each size scaffolds a different number of scenes and branching choices.</p>
            <div className="flex flex-col gap-3">
              {(['small', 'medium', 'large'] as TemplateSize[]).map(size => {
                const info = SIZE_INFO[size]
                const selected = templateSize === size
                return (
                  <button
                    key={size}
                    onClick={() => { setTemplateSize(size); setStep('chapters') }}
                    className={`text-left p-5 bg-white rounded-2xl border-2 transition-all hover:shadow-md ${
                      selected ? 'border-violet-500 shadow-sm' : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-base" style={{ color: '#1e0a3c' }}>{info.label}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{info.subtitle}</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{info.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-violet-600">{info.nodes}</p>
                        <p className="text-xs text-gray-400">{info.choices}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Chapters ── */}
        {step === 'chapters' && (
          <div>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1e0a3c' }}>Would you like chapters?</h2>
            <p className="text-sm text-gray-500 text-center mb-8">Chapters let you group scenes into acts or parts of your story.</p>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookMarked size={20} className="text-violet-500" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e0a3c' }}>Add chapters</p>
                    <p className="text-xs text-gray-500">Organize your scenes into named sections</p>
                  </div>
                </div>
                <button
                  onClick={() => setWantChapters(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${wantChapters ? 'bg-violet-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${wantChapters ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {wantChapters && (
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-sm font-medium mb-3" style={{ color: '#1e0a3c' }}>
                    How many chapters?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from(
                      { length: (templateSize === 'small' ? 3 : templateSize === 'medium' ? 5 : 8) - 1 },
                      (_, i) => i + 2
                    ).map(n => {
                      const selected = chapterCount === n
                      return (
                        <button
                          key={n}
                          onClick={() => setChapterCount(n)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                            selected
                              ? 'border-violet-500 bg-violet-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
                          }`}
                        >
                          <span className={`text-2xl font-bold leading-none ${selected ? 'text-violet-700' : 'text-gray-600'}`}>
                            {n}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            {Array.from({ length: Math.min(n, 4) }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-0.5 rounded-full transition-colors ${selected ? 'bg-violet-400' : 'bg-gray-300'}`}
                                style={{ width: `${18 - i * 2}px` }}
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] font-medium ${selected ? 'text-violet-500' : 'text-gray-400'}`}>
                            {n === 1 ? 'chapter' : 'chapters'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Scenes will be pre-assigned across {chapterCount} chapters. You can reorganize them in the editor.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep('details')}
              className="w-full mt-5 py-3 text-white rounded-xl font-semibold transition-all hover:brightness-110 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 4: Details ── */}
        {step === 'details' && (
          <div>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1e0a3c' }}>Name your story</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              {mode === 'template'
                ? `A ${templateSize} template${wantChapters ? ` with ${chapterCount} chapters` : ''} will be created for you.`
                : 'You can always change these later in the editor.'}
            </p>

            {mode === 'template' && templateSize && (
              <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl text-sm">
                <LayoutTemplate size={16} className="text-violet-500 shrink-0" />
                <span className="text-violet-800">
                  <span className="font-semibold capitalize">{templateSize}</span> template
                  {' · '}{SIZE_INFO[templateSize].nodes} · {SIZE_INFO[templateSize].choices}
                  {wantChapters ? ` · ${chapterCount} chapters` : ''}
                </span>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-7 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1e0a3c' }}>Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setError('') }}
                  placeholder="The Lost Kingdom…"
                  autoFocus
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
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 hover:brightness-110 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                <BookOpen size={16} />
                {loading ? 'Creating…' : 'Create & Start Editing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
