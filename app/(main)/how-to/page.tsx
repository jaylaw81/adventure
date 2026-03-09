import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import {
  Plus, GitBranch, Share2, Sparkles, Play,
  BookOpen, ChevronRight, CheckCircle2, Pencil,
  ArrowRight, MousePointerClick, Settings, Lightbulb,
} from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'How to Create Choose Your Own Adventure Stories | StoryQuestor Guide' },
  description: 'Learn how to create branching interactive stories and how to play them on StoryQuestor.',
}

/* ── UI Mockups (pure JSX, no client JS needed) ──────────────────── */

function CanvasMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      style={{ background: '#0f0e17' }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10" style={{ background: '#1a1730' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 mx-4 bg-white/5 rounded-md h-5 flex items-center px-3">
          <span className="text-xs text-white/30 font-mono">storyquestor.com/edit/…</span>
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5" style={{ background: '#16142a' }}>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-amber-400 border border-amber-400/30 bg-amber-400/10">
          <Plus size={11} /> Add Scene
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white/40 border border-white/10">
          <Settings size={11} /> Settings
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white/40 border border-white/10">
          <Sparkles size={11} /> AI Image
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-gray-900 bg-amber-500">
          Publish
        </div>
      </div>
      {/* Canvas */}
      <div className="relative h-56 overflow-hidden px-4 py-4"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #1e1b3a 0%, #0f0e17 70%)' }}>
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="guide-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guide-dots)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 155 68 C 210 68 215 56 265 56" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#g-arrowA)" />
          <path d="M 155 84 C 210 84 215 112 265 112" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#g-arrowB)" />
          <path d="M 370 56 C 420 56 430 68 460 68" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#g-arrowA)" />
          <path d="M 370 112 C 420 112 440 84 460 82" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#g-arrowB)" />
          <defs>
            <marker id="g-arrowA" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#f59e0b" opacity="0.8" />
            </marker>
            <marker id="g-arrowB" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#a78bfa" opacity="0.8" />
            </marker>
          </defs>
        </svg>
        {/* Start node */}
        <div className="absolute top-8 left-8 w-36 rounded-xl border border-green-500/40 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-green-500/30 bg-green-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs font-semibold text-green-400">Start</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">The forest path splits before you…</p>
          </div>
        </div>
        {/* Scene A */}
        <div className="absolute top-2 left-[265px] w-36 rounded-xl border border-amber-500/30 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Scene</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">You enter the dark cave…</p>
          </div>
        </div>
        {/* Scene B */}
        <div className="absolute top-[78px] left-[265px] w-36 rounded-xl border border-purple-500/30 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-purple-500/20 bg-purple-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-xs font-semibold text-purple-400">Scene</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">The river flows east…</p>
          </div>
        </div>
        {/* Ending */}
        <div className="absolute top-[40px] left-[460px] w-36 rounded-xl border border-red-500/40 shadow-lg" style={{ background: '#1a1025' }}>
          <div className="px-3 py-1.5 rounded-t-xl border-b border-red-500/30 bg-red-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-xs font-semibold text-red-400">Ending</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white leading-snug">The hero triumphs!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReaderMockup() {
  return (
    <div className="relative mx-auto w-64 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-800"
      style={{ background: '#f9fafb' }}>
      <div className="bg-gray-900 h-6 flex items-center justify-center">
        <div className="w-16 h-3 bg-gray-800 rounded-full" />
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs text-gray-400">Chapter 1</span>
          <ChevronRight size={10} className="text-gray-300" />
          <span className="text-xs text-gray-400">The Crossroads</span>
        </div>
        <div className="w-full h-24 rounded-xl mb-3 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a1025, #0f172a)' }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <Sparkles size={22} className="text-amber-400" />
          </div>
          <div className="absolute bottom-1.5 right-2 text-xs text-white/40 bg-black/30 px-1.5 py-0.5 rounded text-[10px]">AI scene</div>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed mb-4">
          The wizard gestures toward two glowing portals. &ldquo;Choose wisely…&rdquo;
        </p>
        <div className="flex flex-col gap-2">
          <div className="w-full px-3 py-2 rounded-xl border-2 border-amber-400 bg-amber-50 text-xs font-medium text-amber-800 flex items-center justify-between">
            Step through the golden portal
            <ArrowRight size={11} className="text-amber-500 shrink-0 ml-1" />
          </div>
          <div className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-600 flex items-center justify-between">
            Take the silver portal
            <ArrowRight size={11} className="text-gray-400 shrink-0 ml-1" />
          </div>
          <div className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-600 flex items-center justify-between">
            Walk away
            <ArrowRight size={11} className="text-gray-400 shrink-0 ml-1" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 py-1.5 flex justify-center border-t border-gray-100">
        <div className="w-16 h-1 rounded-full bg-gray-300" />
      </div>
    </div>
  )
}

function NodeTypeLegend() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Scene Types</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {[
          { color: 'green', label: 'Start', desc: 'Where every reader begins — exactly one per story.' },
          { color: 'amber', label: 'Scene', desc: 'Regular story moments. Add as many as you like.' },
          { color: 'purple', label: 'Scene', desc: 'Scenes can branch off into multiple paths.' },
          { color: 'red', label: 'Ending', desc: 'Concludes a path. Stories can have many endings.' },
        ].map(({ color, label, desc }) => {
          const ring = color === 'green' ? 'border-green-500/40 bg-green-500/10' : color === 'amber' ? 'border-amber-500/30 bg-amber-500/10' : color === 'purple' ? 'border-purple-500/30 bg-purple-500/10' : 'border-red-500/40 bg-red-500/10'
          const dot = color === 'green' ? 'bg-green-400' : color === 'amber' ? 'bg-amber-400' : color === 'purple' ? 'bg-purple-400' : 'bg-red-400'
          const text = color === 'green' ? 'text-green-400' : color === 'amber' ? 'text-amber-400' : color === 'purple' ? 'text-purple-400' : 'text-red-400'
          return (
            <div key={desc} className={`rounded-xl border px-3 py-2.5 ${ring}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className={`text-xs font-bold ${text}`}>{label}</span>
              </div>
              <p className="text-xs text-white/50 leading-snug">{desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConnectionMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Connecting Scenes</p>
      </div>
      <div className="relative px-6 py-8 flex items-center justify-between gap-0">
        <div className="w-28 rounded-xl border border-amber-500/30 bg-amber-500/10 shrink-0">
          <div className="px-3 py-1.5 border-b border-amber-500/20 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Scene A</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs text-white/60 leading-snug">You reach a locked door…</p>
          </div>
          {/* Connection handle */}
          <div className="absolute right-[calc(50%-2px)] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-gray-900 shadow" />
        </div>
        {/* Arrow */}
        <div className="flex-1 flex flex-col items-center gap-1 px-2">
          <div className="h-px w-full bg-amber-400/60 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
              style={{ borderLeft: '8px solid rgba(251,191,36,0.7)', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
          </div>
          <span className="text-xs text-amber-400/80 font-medium bg-gray-900/80 px-2 py-0.5 rounded-full border border-amber-400/20">
            Pick the lock
          </span>
        </div>
        <div className="w-28 rounded-xl border border-purple-500/30 bg-purple-500/10 shrink-0">
          <div className="px-3 py-1.5 border-b border-purple-500/20 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-xs font-semibold text-purple-400">Scene B</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs text-white/60 leading-snug">The door creaks open…</p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <MousePointerClick size={13} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300">Drag from the edge handle of one scene to another to create a choice</p>
        </div>
      </div>
    </div>
  )
}

/* ── Schema ──────────────────────────────────────────────────────── */

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use StoryQuestor',
  description: 'Learn how to create branching interactive stories and how to play them on StoryQuestor.',
  step: [
    {
      '@type': 'HowToSection',
      name: 'Creating a Story',
      itemListElement: [
        { '@type': 'HowToStep', position: 1, name: 'Create a new story', text: 'Sign in, then click New Story on the home page. Give your story a title and an optional description.' },
        { '@type': 'HowToStep', position: 2, name: 'Set audience and tags', text: 'Click Settings in the toolbar to set the audience (All Ages, Teens, or Adults Only) and tags.' },
        { '@type': 'HowToStep', position: 3, name: 'Add scenes to the canvas', text: 'Click Add Scene in the toolbar. Click any scene card to open the editor panel.' },
        { '@type': 'HowToStep', position: 4, name: 'Connect scenes with choices', text: 'Hover a scene card to reveal handles. Drag from a handle to another scene to create a choice.' },
        { '@type': 'HowToStep', position: 5, name: 'Generate AI scene images', text: 'Open a completed scene and click Generate Image with AI.' },
        { '@type': 'HowToStep', position: 6, name: 'Publish your story', text: 'Toggle Make Public on your story card to publish and list it on the Explore page.' },
      ],
    },
    {
      '@type': 'HowToSection',
      name: 'Playing a Story',
      itemListElement: [
        { '@type': 'HowToStep', position: 1, name: 'Find a story', text: 'Browse the Explore page or open a shared link.' },
        { '@type': 'HowToStep', position: 2, name: 'Read each scene', text: 'Each scene shows a title, illustrated image, and story prose.' },
        { '@type': 'HowToStep', position: 3, name: 'Make your choice', text: 'Click a choice button to move to the next scene.' },
        { '@type': 'HowToStep', position: 4, name: 'Go back', text: 'Use the Back button to undo your last choice.' },
        { '@type': 'HowToStep', position: 5, name: 'Reach an ending', text: 'Endings show — The End —. Click Play Again to restart.' },
        { '@type': 'HowToStep', position: 6, name: 'Rate and review', text: 'At the end of a story you can leave a star rating and written review.' },
      ],
    },
  ],
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function HowToPage() {
  return (
    <div className="flex flex-col">
      <JsonLd data={howToSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 60%, #1a1025 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b, #a78bfa, transparent)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-400/20">
            <BookOpen size={14} />
            User Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            How to Use<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
              StoryQuestor
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Everything you need to create branching stories and play through adventures made by others.
          </p>
        </div>
      </section>

      {/* ── Quick Nav ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
          <a href="#creating" className="shrink-0 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors py-1">
            <Pencil size={14} />
            Creating Stories
          </a>
          <a href="#playing" className="shrink-0 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors py-1">
            <Play size={14} />
            Playing Stories
          </a>
          <a href="#tips" className="shrink-0 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors py-1">
            <Lightbulb size={14} />
            Tips & Tricks
          </a>
        </div>
      </div>

      {/* ── Creating Stories ── */}
      <section id="creating" className="px-6 py-20" style={{ background: 'linear-gradient(180deg, #0f0e17 0%, #1a1025 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Pencil size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Part 1</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Creating a Story</h2>
            </div>
          </div>
          <p className="text-gray-400 mb-12 ml-[52px]">Build your branching adventure from scratch on the visual canvas.</p>

          <div className="flex flex-col gap-16">

            {/* Step 1 + 2: Create & Settings */}
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1 flex flex-col gap-8">
                <StepCard number={1} title="Create a new story" accent="amber">
                  Sign in, then click <Kbd>New Story</Kbd> on the home page. Give your story a title and an optional description — you can always update these later in settings.
                </StepCard>
                <StepCard number={2} title="Set your audience and tags" accent="amber">
                  Click the <Kbd>Settings</Kbd> button in the editor toolbar to configure:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Audience</strong> — All Ages, Teens, or Adults Only. Affects how AI images are generated.</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Tags</strong> — Keywords like fantasy, mystery, horror. Press Enter after each tag.</span></li>
                  </ul>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-lg">
                <CanvasMockup />
              </div>
            </div>

            {/* Step 3: Scenes */}
            <div className="flex flex-col lg:flex-row-reverse gap-10 items-start">
              <div className="flex-1 flex flex-col gap-4">
                <StepCard number={3} title="Add scenes to the canvas" accent="amber">
                  Click <Kbd>Add Scene</Kbd> in the toolbar. A new scene card appears on the canvas. Click any card to open the editor panel where you can:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Set the <strong className="text-white">Scene Type</strong> — Start, Scene, or Ending</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Write a <strong className="text-white">Title</strong> and <strong className="text-white">Content</strong></span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Mark the scene as <strong className="text-white">Completed</strong> when you&apos;re done</span></li>
                  </ul>
                  <Callout>Every story needs exactly one <strong>Start</strong> scene and at least one <strong>Ending</strong> scene.</Callout>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-sm">
                <NodeTypeLegend />
              </div>
            </div>

            {/* Step 4: Connections */}
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1">
                <StepCard number={4} title="Connect scenes with choices" accent="amber">
                  Hover over any scene card to reveal connection handles on the edges. Drag from a handle on one scene to another to create a choice. A prompt will ask you to name the choice (e.g. "Go left" or "Open the door").
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Double-click a choice label to <strong className="text-white">rename</strong> it</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Click once to reveal a <strong className="text-white">delete</strong> button</span></li>
                  </ul>
                  <Callout>Readers see choices in the order they were created — up to 3 choices per scene.</Callout>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-lg">
                <ConnectionMockup />
              </div>
            </div>

            {/* Step 5 + 6 */}
            <div className="flex flex-col lg:flex-row-reverse gap-10 items-start">
              <div className="flex-1 flex flex-col gap-8">
                <StepCard number={5} title="Generate AI scene images" accent="amber">
                  Open a completed scene and click <Kbd><Sparkles size={11} className="inline" /> Generate Image with AI</Kbd>. StoryQuestor creates a cinematic illustration based on your scene title and content.
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>You can regenerate up to <strong className="text-white">two times</strong> per scene</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Images generate automatically when you mark a scene <strong className="text-white">Completed</strong></span></li>
                  </ul>
                </StepCard>
                <StepCard number={6} title="Publish and share" accent="amber">
                  On the home page, click <Kbd><Share2 size={11} className="inline" /> Share</Kbd> on your story card. This generates a public link and lists your story on the <Link href="/explore" className="text-amber-400 hover:underline">Explore</Link> page.
                  <Callout>Toggle sharing off at any time to make a story private again.</Callout>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-sm">
                <AiImageMockup />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Playing Stories ── */}
      <section id="playing" className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Play size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">Part 2</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Playing a Story</h2>
            </div>
          </div>
          <p className="text-gray-500 mb-12 ml-[52px]">Discover stories created by the community and navigate branching paths.</p>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Steps */}
            <div className="flex-1 flex flex-col gap-6">
              {[
                {
                  n: 1, title: 'Find a story',
                  body: <>Browse the <Link href="/explore" className="text-amber-600 hover:underline font-medium">Explore</Link> page to discover public stories. Click <Kbd dark>Play</Kbd> on any card, then <Kbd dark>Start Playing</Kbd>. Or just open a direct link someone shared with you.</>
                },
                {
                  n: 2, title: 'Read each scene',
                  body: <>Each scene shows a <strong>title</strong>, an <strong>AI-generated illustration</strong>, and <strong>story prose</strong>. Read through it before choosing — the writing gives you context for each option.</>
                },
                {
                  n: 3, title: 'Make your choice',
                  body: <>At the bottom of every scene you&apos;ll see up to three choice buttons. Tap one to move to the next scene. Every choice shapes your unique path through the story.</>
                },
                {
                  n: 4, title: 'Navigate and go back',
                  body: <>Use the <Kbd dark>← Back</Kbd> button in the top-left to undo your last choice and try a different path. Use <Kbd dark>Home</Kbd> to return to the main page at any time.</>
                },
                {
                  n: 5, title: 'Reach an ending',
                  body: <>When you arrive at an Ending scene the story concludes with <em>— The End —</em>. Click <Kbd dark>Play Again</Kbd> to restart from the beginning and discover different outcomes.</>
                },
                {
                  n: 6, title: 'Rate and review',
                  body: <>After reaching an ending you can leave a <strong>star rating</strong> and a <strong>written review</strong>. Ratings are shown on the Explore page to help other readers find great stories.</>
                },
              ].map(({ n, title, body }) => (
                <StepCard key={n} number={n} title={title} accent="light">
                  {body}
                </StepCard>
              ))}
            </div>

            {/* Phone mockup — sticky on desktop */}
            <div className="hidden lg:flex flex-col items-center gap-4 sticky top-24 w-72 shrink-0">
              <ReaderMockup />
              <p className="text-xs text-gray-400 text-center">The reader experience — clean, immersive, works on any device</p>
            </div>
          </div>

          {/* Mobile phone mockup */}
          <div className="lg:hidden flex flex-col items-center gap-4 mt-10">
            <ReaderMockup />
            <p className="text-xs text-gray-400 text-center">The reader experience — clean, immersive, works on any device</p>
          </div>
        </div>
      </section>

      {/* ── Tips ── */}
      <section id="tips" className="px-6 py-20"
        style={{ background: 'linear-gradient(135deg, #1a1025 0%, #0f172a 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Lightbulb size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Pro Tips</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Tips &amp; Tricks</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: GitBranch, tip: 'Every story must have a Start scene — without one, readers can\'t begin.' },
              { icon: CheckCircle2, tip: 'Scenes marked Completed are highlighted on the canvas so you can track progress.' },
              { icon: MousePointerClick, tip: 'Drag scenes freely to rearrange the canvas — positions are saved automatically.' },
              { icon: BookOpen, tip: 'The home page shows reachable ending count — a useful measure of story depth.' },
              { icon: Sparkles, tip: 'AI images respect your audience setting — Adults Only stories never depict minors.' },
              { icon: GitBranch, tip: 'Deleting a scene also removes all choices connected to it — check your canvas after.' },
            ].map(({ icon: Icon, tip }) => (
              <div key={tip} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/8 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-amber-400" />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Ready to start your story?</h2>
          <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
            Create a free account and have your first branching story live in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
              <Plus size={16} />
              Create a free account
            </Link>
            <Link href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              <Play size={15} />
              Browse stories
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────── */

function StepCard({ number, title, accent, children }: { number: number; title: string; accent: 'amber' | 'light'; children: React.ReactNode }) {
  const dark = accent === 'amber'
  return (
    <div className={`rounded-2xl border p-6 ${dark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shrink-0"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
          {number}
        </div>
        <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      </div>
      <div className={`text-sm leading-relaxed ml-11 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
        {children}
      </div>
    </div>
  )
}

function Kbd({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border mx-0.5 ${
      dark
        ? 'bg-gray-100 text-gray-700 border-gray-200'
        : 'bg-white/10 text-white border-white/20'
    }`}>
      {children}
    </span>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
      <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-300 leading-relaxed">{children}</p>
    </div>
  )
}

function AiImageMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">AI Scene Image</p>
      </div>
      <div className="p-4">
        {/* Scene card */}
        <div className="rounded-xl border border-amber-500/30 overflow-hidden mb-3" style={{ background: '#1a1025' }}>
          <div className="px-3 py-2 border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Scene — The Haunted Tower</span>
          </div>
          {/* Image area - loading state */}
          <div className="w-full h-28 relative flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e1b3a, #0f0e17)' }}>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400/60 border-t-amber-400 animate-spin" />
              <span className="text-xs text-white/30">Generating image…</span>
            </div>
          </div>
          <div className="px-3 py-3">
            <p className="text-xs text-white/50 leading-relaxed line-clamp-2">The tower loomed against the moonlit sky, its windows flickering with an eerie light…</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-400">
            <Sparkles size={11} /> Generate Image
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40">
            2 left
          </div>
        </div>
        <p className="text-xs text-white/30 text-center mt-3">AI creates a cinematic illustration from your scene content</p>
      </div>
    </div>
  )
}
