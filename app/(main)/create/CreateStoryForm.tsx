'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, LayoutTemplate, AlignLeft, BookMarked, Check, Layers, GitBranch, Globe, Map } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import PageBanner from '@/components/shared/PageBanner'

type StoryType = 'path' | 'world'
type EditorMode = 'node' | 'block'
type Mode = 'template' | 'blank'
type TemplateSize = 'small' | 'medium' | 'large'
type Step = 'storyType' | 'editor' | 'mode' | 'size' | 'chapters' | 'details'

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
  storyType: 'Story type',
  editor: 'Editor',
  mode: 'Start type',
  size: 'Story size',
  chapters: 'Chapters',
  details: 'Details',
}

function StepDots({ current, editorMode, storyType }: { current: Step; editorMode: EditorMode | null; storyType: StoryType | null }) {
  // storyType step is the entry — no dots yet
  if (current === 'storyType') return null

  const steps: Step[] = storyType === 'world'
    ? ['mode', 'size', 'details']
    : editorMode === 'block'
      ? ['mode', 'size', 'details']
      : ['mode', 'size', 'chapters', 'details']

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

export default function CreateStoryForm({ isFreeTier = false }: { isFreeTier?: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('storyType')
  const [storyType, setStoryType] = useState<StoryType | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null)
  const [mode, setMode] = useState<Mode | null>(null)
  const [templateSize, setTemplateSize] = useState<TemplateSize | null>(null)
  const [wantChapters, setWantChapters] = useState(false)
  const [chapterCount, setChapterCount] = useState(2)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function goBack() {
    if (step === 'editor') setStep('storyType')
    else if (step === 'mode') {
      if (storyType === 'world') setStep('storyType')
      else setStep('editor')
    }
    else if (step === 'size') setStep('mode')
    else if (step === 'chapters') setStep('size')
    else if (step === 'details') {
      if (mode === 'blank') setStep('mode')
      else if (storyType === 'world' || editorMode === 'block') setStep('size')
      else setStep('chapters')
    }
  }

  async function handleCreate() {
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        editorMode: storyType === 'world' ? 'node' : (editorMode ?? 'node'),
        storyType: storyType ?? 'path',
      }
      if (mode === 'template' && templateSize) {
        body.template = templateSize
        body.chapterCount = (editorMode === 'block' || !wantChapters) ? 0 : chapterCount
      }
      const res = await fetch('/api/adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.code === 'free_tier_limit') { router.push('/pricing?reason=free_tier_limit'); return }
        setError(data?.error || 'Failed to create story')
        setLoading(false)
        return
      }
      analytics.adventureCreated(title.trim())
      router.push(`/edit/${data.id}`)
    } catch {
      setError('Failed to create story')
      setLoading(false)
    }
  }

  const backAction = step === 'storyType' ? (
    <Link href="/" className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
      <ArrowLeft size={15} /> Back
    </Link>
  ) : (
    <button onClick={goBack} className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm transition-colors">
      <ArrowLeft size={15} /> Back
    </button>
  )

  return (
    <>
      <PageBanner
        title="New Story"
        subtitle="Set up your adventure before you start writing"
        action={backAction}
      />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <StepDots current={step} editorMode={editorMode} storyType={storyType} />

        {/* ── Step 0: Story type ── */}
        {step === 'storyType' && (
          <div>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1e0a3c' }}>
              What kind of story are you building?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Choose the experience your readers will have. You can always start simple.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Story Path */}
              <button
                onClick={() => { setStoryType('path'); setStep('editor') }}
                className="group text-left p-6 bg-white rounded-2xl border-2 border-violet-200 hover:border-violet-500 hover:shadow-md transition-all"
              >
                <div className="w-full h-28 bg-violet-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 140 90" className="w-full h-full" aria-hidden>
                    <circle cx="70" cy="16" r="10" fill="#7c3aed" />
                    <circle cx="36" cy="52" r="8" fill="#6d28d9" />
                    <circle cx="104" cy="52" r="8" fill="#6d28d9" />
                    <circle cx="22" cy="80" r="7" fill="#8b5cf6" />
                    <circle cx="50" cy="80" r="7" fill="#8b5cf6" />
                    <circle cx="104" cy="80" r="7" fill="#8b5cf6" />
                    <line x1="62" y1="25" x2="42" y2="45" stroke="#a78bfa" strokeWidth="1.5" />
                    <line x1="78" y1="25" x2="98" y2="45" stroke="#a78bfa" strokeWidth="1.5" />
                    <line x1="30" y1="60" x2="24" y2="73" stroke="#c4b5fd" strokeWidth="1.5" />
                    <line x1="40" y1="60" x2="48" y2="73" stroke="#c4b5fd" strokeWidth="1.5" />
                    <line x1="104" y1="60" x2="104" y2="73" stroke="#c4b5fd" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Map size={15} className="text-violet-500" />
                  <h3 className="font-bold text-base" style={{ color: '#1e0a3c' }}>Story Path</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A classic choose-your-own-adventure. Readers navigate branching scenes by making choices.
                </p>
              </button>

              {/* World Builder */}
              <button
                onClick={isFreeTier
                  ? () => router.push('/pricing')
                  : () => { setStoryType('world'); setEditorMode('node'); setStep('mode') }
                }
                className={`group text-left p-6 bg-white rounded-2xl border-2 transition-all relative ${
                  isFreeTier
                    ? 'border-gray-100 opacity-60 cursor-pointer'
                    : 'border-amber-200 hover:border-amber-500 hover:shadow-md'
                }`}
              >
                {isFreeTier && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Paid plan
                  </span>
                )}
                <div className="w-full h-28 bg-amber-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                  <svg viewBox="0 0 140 90" className="w-full h-full" aria-hidden>
                    {/* Character silhouettes */}
                    <circle cx="40" cy="30" r="8" fill="#f59e0b" />
                    <rect x="33" y="40" width="14" height="18" rx="4" fill="#f59e0b" />
                    <circle cx="100" cy="30" r="8" fill="#d97706" />
                    <rect x="93" y="40" width="14" height="18" rx="4" fill="#d97706" />
                    {/* Stats bars */}
                    <rect x="20" y="65" width="40" height="4" rx="2" fill="#fde68a" />
                    <rect x="20" y="65" width="28" height="4" rx="2" fill="#f59e0b" />
                    <rect x="80" y="65" width="40" height="4" rx="2" fill="#fde68a" />
                    <rect x="80" y="65" width="35" height="4" rx="2" fill="#d97706" />
                    {/* Path arrow */}
                    <path d="M58 50 L82 50" stroke="#9ca3af" strokeWidth="2" strokeDasharray="3,2" markerEnd="url(#arrowhead)" />
                    <defs>
                      <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="#9ca3af" />
                      </marker>
                    </defs>
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={15} className="text-amber-500" />
                  <h3 className="font-bold text-base" style={{ color: '#1e0a3c' }}>World Builder</h3>
                  {!isFreeTier && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">New</span>}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Create characters with stats and attributes. Choices can affect them — readers see their party status as the story unfolds.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Editor ── */}
        {step === 'editor' && (
          <div>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1e0a3c' }}>
              How would you like to build?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Choose your editing experience. You can switch editors later from story settings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Node Graph */}
              <button
                onClick={isFreeTier
                  ? () => router.push('/pricing')
                  : () => { setEditorMode('node'); setStep('mode') }
                }
                className={`group text-left p-6 bg-white rounded-2xl border-2 transition-all relative ${
                  isFreeTier
                    ? 'border-gray-100 opacity-60 cursor-pointer'
                    : 'border-violet-200 hover:border-violet-500 hover:shadow-md'
                }`}
              >
                {isFreeTier && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Paid plan
                  </span>
                )}
                <div className="w-full h-28 bg-violet-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 140 90" className="w-full h-full" aria-hidden>
                    <circle cx="70" cy="16" r="10" fill="#7c3aed" />
                    <circle cx="36" cy="52" r="8" fill="#6d28d9" />
                    <circle cx="104" cy="52" r="8" fill="#6d28d9" />
                    <circle cx="22" cy="80" r="7" fill="#8b5cf6" />
                    <circle cx="50" cy="80" r="7" fill="#8b5cf6" />
                    <circle cx="104" cy="80" r="7" fill="#8b5cf6" />
                    <line x1="62" y1="25" x2="42" y2="45" stroke="#a78bfa" strokeWidth="1.5" />
                    <line x1="78" y1="25" x2="98" y2="45" stroke="#a78bfa" strokeWidth="1.5" />
                    <line x1="30" y1="60" x2="24" y2="73" stroke="#c4b5fd" strokeWidth="1.5" />
                    <line x1="40" y1="60" x2="48" y2="73" stroke="#c4b5fd" strokeWidth="1.5" />
                    <line x1="104" y1="60" x2="104" y2="73" stroke="#c4b5fd" strokeWidth="1.5" />
                    <circle cx="70" cy="16" r="3" fill="white" fillOpacity="0.6" />
                    <circle cx="36" cy="52" r="2.5" fill="white" fillOpacity="0.5" />
                    <circle cx="104" cy="52" r="2.5" fill="white" fillOpacity="0.5" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <GitBranch size={15} className="text-violet-500" />
                  <h3 className="font-bold text-base" style={{ color: '#1e0a3c' }}>Node Graph</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Drag and connect scenes on a freeform canvas. Best for complex branching stories.
                </p>
              </button>

              {/* Block Builder */}
              <button
                onClick={() => { setEditorMode('block'); setStep('mode') }}
                className="group text-left p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all"
              >
                <div className="w-full h-28 bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden px-8 py-3">
                  <div className="w-full flex flex-col gap-2">
                    {[
                      { color: 'bg-green-500', w: 'w-10' },
                      { color: 'bg-indigo-500', w: 'w-14' },
                      { color: 'bg-indigo-500', w: 'w-12' },
                      { color: 'bg-purple-500', w: 'w-8' },
                    ].map(({ color, w }, i) => (
                      <div key={i} className="rounded-lg overflow-hidden shadow-sm border border-gray-200/60">
                        <div className={`h-3 ${color} px-2 flex items-center gap-1`}>
                          <div className="h-1 w-1 rounded-full bg-white/70" />
                          <div className={`h-1 ${w} bg-white/40 rounded`} />
                        </div>
                        <div className="h-4 bg-white px-2 flex flex-col justify-center gap-0.5">
                          <div className="h-0.5 bg-gray-200 rounded w-full" />
                          <div className="h-0.5 bg-gray-100 rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers size={15} className="text-indigo-500" />
                  <h3 className="font-bold text-base" style={{ color: '#1e0a3c' }}>Block Builder</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Write scenes as stacked, draggable blocks with inline choices. Inspired by Scratch.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Mode ── */}
        {step === 'mode' && (
          <div>
            <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1e0a3c' }}>How would you like to start?</h2>
            <p className="text-sm text-gray-500 text-center mb-8">Templates give you a ready-made story structure to fill in.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setMode('template'); setStep('size'); }}
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
                const nextStep = (storyType === 'world' || editorMode === 'block') ? 'details' : 'chapters'
                return (
                  <button
                    key={size}
                    onClick={() => { setTemplateSize(size); setStep(nextStep) }}
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

        {/* ── Step 3: Chapters (node mode only) ── */}
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
                ? `A ${templateSize} template${editorMode === 'node' && wantChapters ? ` with ${chapterCount} chapters` : ''} will be created for you.`
                : 'You can always change these later in the editor.'}
            </p>

            {/* Summary badges */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {storyType === 'world' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                  <Globe size={11} />
                  World Builder
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  editorMode === 'block' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700'
                }`}>
                  {editorMode === 'block' ? <Layers size={11} /> : <GitBranch size={11} />}
                  {editorMode === 'block' ? 'Block Builder' : 'Node Graph'}
                </span>
              )}
              {mode === 'template' && templateSize && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  <LayoutTemplate size={11} />
                  {SIZE_INFO[templateSize].label} template · {SIZE_INFO[templateSize].nodes}
                </span>
              )}
              {mode === 'blank' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  <AlignLeft size={11} />
                  Blank
                </span>
              )}
            </div>

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
