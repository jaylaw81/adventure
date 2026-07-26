import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { getPricingConfig, getMinPriceCopy } from '@/lib/pricing'
import {
  Plus, GitBranch, Share2, Sparkles, Play,
  BookOpen, ChevronRight, CheckCircle2, Pencil,
  ArrowRight, MousePointerClick, Settings, Lightbulb, BookMarked, Music,
  Users, Sword, Package, Shield, Heart, Zap,
} from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'How to Create Choose Your Own Adventure Stories | StoryQuestor Guide' },
  description: 'Learn how to create branching interactive stories and how to play them on StoryQuestor.',
}

/* ── UI Mockups (pure JSX, no client JS needed) ──────────────────── */

function CanvasMockup() {
  return (
    <div aria-hidden="true" className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
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
          <Sparkles size={11} /> Image
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
    <div aria-hidden="true" className="relative mx-auto w-64 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-800"
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
          <div className="absolute bottom-1.5 right-2 text-xs text-white/40 bg-black/30 px-1.5 py-0.5 rounded text-[10px]">Scene image</div>
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
    <div aria-hidden="true" className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Scene Types</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {[
          { color: 'green', label: 'Start', desc: 'Where every reader begins — one per chapter.' },
          { color: 'amber', label: 'Scene', desc: 'Regular story moments. Add as many as you like.' },
          { color: 'red', label: 'Ending', desc: 'Concludes a path. Stories can have many endings.' },
          { color: 'teal', label: 'Next Chapter', desc: 'Ends a chapter and sends readers to the start of the next one.' },
        ].map(({ color, label, desc }) => {
          const ring = color === 'green' ? 'border-green-500/40 bg-green-500/10' : color === 'amber' ? 'border-amber-500/30 bg-amber-500/10' : color === 'teal' ? 'border-teal-400/40 bg-teal-400/10' : 'border-red-500/40 bg-red-500/10'
          const dot = color === 'green' ? 'bg-green-400' : color === 'amber' ? 'bg-amber-400' : color === 'teal' ? 'bg-teal-400' : 'bg-red-400'
          const text = color === 'green' ? 'text-green-400' : color === 'amber' ? 'text-amber-400' : color === 'teal' ? 'text-teal-400' : 'text-red-400'
          return (
            <div key={desc} className={`rounded-xl border px-3 py-2.5 ${ring}`}>
              <div className="flex items-center gap-2 mb-1">
                {color === 'teal'
                  ? <BookMarked size={11} className="text-teal-400" />
                  : <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                }
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
    <div aria-hidden="true" className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
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
        { '@type': 'HowToStep', position: 3, name: 'Add scenes to the canvas', text: 'Click Add Scene in the toolbar. Click any scene card to open the editor panel. You can set a scene type, write content, mark it Done, and attach ambient sound or music that plays automatically for readers.' },
        { '@type': 'HowToStep', position: 4, name: 'Organize scenes into chapters', text: 'Use the chapter sidebar to add chapters. Each chapter gets its own canvas view and a Start scene. Use Next Chapter scenes to link chapters together. Set an Entry scene on a Next Chapter scene to send readers to a specific scene in the next chapter.' },
        { '@type': 'HowToStep', position: 5, name: 'Connect scenes with choices', text: 'Hover a scene card to reveal handles. Drag from a handle to another scene to create a choice.' },
        { '@type': 'HowToStep', position: 6, name: 'Generate scene images', text: 'Open a completed scene and click Generate Image.' },
        { '@type': 'HowToStep', position: 7, name: 'Publish your story', text: 'Toggle Make Public on your story card to publish and list it on the Explore page.' },
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
    {
      '@type': 'HowToSection',
      name: 'World Builder',
      itemListElement: [
        { '@type': 'HowToStep', position: 1, name: 'Choose World Builder', text: 'Select World Builder when creating a new story to unlock characters, items, and foe combat.' },
        { '@type': 'HowToStep', position: 2, name: 'Create hero characters', text: 'Add party members with custom attributes like HP, Gold, and Strength.' },
        { '@type': 'HowToStep', position: 3, name: 'Create foes', text: 'Add foe characters with HP, damage-per-round, defeat text, and an emoji icon.' },
        { '@type': 'HowToStep', position: 4, name: 'Create items', text: 'Add weapons, potions, and revival items. Set damage values, stat effects, and durability.' },
        { '@type': 'HowToStep', position: 5, name: 'Place items and foes in scenes', text: 'Assign foes to scenes and place item pickups that readers collect as they explore.' },
        { '@type': 'HowToStep', position: 6, name: 'Configure choice paths', text: 'Add stat effects and conditions to choices — e.g. HP −10, or show only if Strength ≥ 15.' },
        { '@type': 'HowToStep', position: 7, name: 'Set health and armor', text: 'Designate which attribute is health and which is armor for each hero. Armor absorbs damage first.' },
      ],
    },
  ],
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function HowToPage() {
  const pricing = await getPricingConfig()
  const minPrice = getMinPriceCopy(pricing)
  return (
    <div className="flex flex-col">
      <JsonLd data={howToSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-36 pb-16 text-center -mt-16"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(124,58,237,0.2) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(167,139,250,0.3)' }}>
            <BookOpen size={14} />
            User Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            How to Use<br />
            <span className="text-amber-400">StoryQuestor</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Everything you need to create branching stories and play through adventures made by others.
          </p>
        </div>
      </section>

      {/* ── Quick Nav ── */}
      <nav aria-label="On this page" className="sticky top-0 z-20 border-b border-white/8" style={{ background: 'rgba(15,14,23,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <a href="#creating" className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/50 hover:text-amber-400 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:rounded-md">
            <Pencil size={13} />
            Creating Stories
          </a>
          <a href="#playing" className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/50 hover:text-amber-400 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:rounded-md">
            <Play size={13} />
            Playing Stories
          </a>
          <a href="#world-builder" className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/50 hover:text-amber-400 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:rounded-md">
            <Sword size={13} />
            World Builder
          </a>
          <a href="#tips" className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/50 hover:text-amber-400 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:rounded-md">
            <Lightbulb size={13} />
            Tips &amp; Tricks
          </a>
        </div>
      </nav>

      {/* ── Creating Stories ── */}
      <section id="creating" className="px-6 py-20" style={{ background: 'linear-gradient(180deg, #0f0e17 0%, #1a1025 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Pencil size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Part 1</p>
              <h2 id="creating-a-story" className="text-2xl sm:text-3xl font-extrabold text-white">Creating a Story</h2>
            </div>
          </div>
          <p className="text-gray-400 mb-12 ml-[52px]">Build your branching adventure from scratch on the visual canvas.</p>

          <div className="flex flex-col gap-16">

            {/* Step 1 + 2: Create & Settings */}
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1 flex flex-col gap-8">
                <StepCard number={1} title="Create a new story" accent="amber" id="create-a-new-story">
                  Sign in, then click <Kbd>New Story</Kbd> on the home page. Give your story a title and an optional description — you can always update these later in settings.
                  <Callout>Creating and editing stories requires a subscription (from {minPrice}). Reading stories is always free.</Callout>
                </StepCard>
                <StepCard number={2} title="Set your audience and tags" accent="amber" id="audience-and-tags">
                  Click the <Kbd>Settings</Kbd> button in the editor toolbar to configure:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Audience</strong> — All Ages, Teens, or Adults Only. Affects how scene images are generated.</span></li>
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
                <StepCard number={3} title="Add scenes to the canvas" accent="amber" id="add-scenes">
                  Click <Kbd>Add Scene</Kbd> in the toolbar. A new scene card appears on the canvas. Click any card to open the editor panel where you can:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Set the <strong className="text-white">Scene Type</strong> — Start, Scene, Ending, or Next Chapter</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Write a <strong className="text-white">Title</strong> and <strong className="text-white">Content</strong></span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Mark the scene as <strong className="text-white">Done</strong> when you&apos;re finished writing it</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Click the <strong className="text-white">music note button</strong> to search and attach ambient sound or music — it autoplays when readers reach the scene</span></li>
                  </ul>
                  <Callout>Each chapter needs one <strong>Start</strong> scene. Use <strong>Ending</strong> to conclude a path, or <strong>Next Chapter</strong> to send readers onward.</Callout>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-sm">
                <NodeTypeLegend />
              </div>
            </div>

            {/* Step 4: Chapters */}
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1">
                <StepCard number={4} title="Organize scenes into chapters" accent="amber" id="chapters">
                  Use the <strong className="text-white">chapter sidebar</strong> on the left to break your story into acts or chapters. Every new story starts with Chapter 1 already created.
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Click <strong className="text-white">Add Chapter</strong> in the sidebar to create a new chapter — a Start scene is added automatically</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Select a chapter to view only its scenes on the canvas</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Add a <strong className="text-white">Next Chapter</strong> scene to link the end of one chapter to the start of the next</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Use the <strong className="text-white">Entry scene</strong> dropdown on a Next Chapter scene to send readers to a specific scene in the next chapter, not just the default Start</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Click <Kbd>View all scenes</Kbd> at the bottom of the sidebar to see the full story at once</span></li>
                  </ul>
                  <Callout>Each chapter is its own canvas view — keeping things clean even for epic, multi-chapter stories.</Callout>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-lg">
                <ChaptersMockup />
              </div>
            </div>

            {/* Step 5: Connections */}
            <div className="flex flex-col lg:flex-row-reverse gap-10 items-start">
              <div className="flex-1">
                <StepCard number={5} title="Connect scenes with choices" accent="amber" id="connect-scenes">
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

            {/* Step 6 + 7 */}
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1 flex flex-col gap-8">
                <StepCard number={6} title="Generate scene images" accent="amber" id="ai-images">
                  Open a completed scene and click <Kbd><Sparkles size={11} className="inline" /> Generate Image</Kbd>. StoryQuestor creates a cinematic illustration based on your scene title and content.
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>You can regenerate up to <strong className="text-white">two times</strong> per scene</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Images generate automatically when you mark a scene <strong className="text-white">Completed</strong></span></li>
                  </ul>
                </StepCard>
                <StepCard number={7} title="Publish and share" accent="amber" id="publish-and-share">
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
              <h2 id="playing-a-story" className="text-2xl sm:text-3xl font-extrabold text-gray-900">Playing a Story</h2>
            </div>
          </div>
          <p className="text-gray-500 mb-12 ml-[52px]">Discover stories created by the community and navigate branching paths.</p>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Steps */}
            <div className="flex-1 flex flex-col gap-6">
              {[
                {
                  n: 1, title: 'Find a story', id: 'find-a-story',
                  body: <>Browse the <Link href="/explore" className="text-amber-600 hover:underline font-medium">Explore</Link> page to discover public stories. Click <Kbd dark>Play</Kbd> on any card, then <Kbd dark>Start Playing</Kbd>. Or just open a direct link someone shared with you.</>
                },
                {
                  n: 2, title: 'Read each scene', id: 'read-each-scene',
                  body: <>Each scene shows a <strong>title</strong>, an <strong>illustration</strong>, and <strong>story prose</strong>. Read through it before choosing — the writing gives you context for each option.</>
                },
                {
                  n: 3, title: 'Make your choice', id: 'make-your-choice',
                  body: <>At the bottom of every scene you&apos;ll see up to three choice buttons. Tap one to move to the next scene. Every choice shapes your unique path through the story.</>
                },
                {
                  n: 4, title: 'Navigate and go back', id: 'navigate-and-go-back',
                  body: <>Use the <Kbd dark>← Back</Kbd> button in the top-left to undo your last choice and try a different path. Use <Kbd dark>Home</Kbd> to return to the main page at any time.</>
                },
                {
                  n: 5, title: 'Reach an ending', id: 'reach-an-ending',
                  body: <>When you arrive at an Ending scene you&apos;ll see a short ceremony marking the close of that path. Click <Kbd dark>Play Again</Kbd> to restart and discover different outcomes.</>
                },
                {
                  n: 6, title: 'Rate and review', id: 'rate-and-review',
                  body: <>After reaching an ending you can leave a <strong>star rating</strong> and a <strong>written review</strong>. Ratings are shown on the Explore page to help other readers find great stories.</>
                },
              ].map(({ n, title, id, body }) => (
                <StepCard key={n} number={n} title={title} accent="light" id={id}>
                  {body}
                </StepCard>
              ))}
            </div>

            {/* Phone mockup — sticky on desktop */}
            <div className="hidden lg:flex flex-col items-center gap-4 sticky top-24 w-72 shrink-0">
              <ReaderMockup />
              <p className="text-xs text-gray-500 text-center">The reader experience — clean, immersive, works on any device</p>
            </div>
          </div>

          {/* Mobile phone mockup */}
          <div className="lg:hidden flex flex-col items-center gap-4 mt-10">
            <ReaderMockup />
            <p className="text-xs text-gray-400 text-center">The reader experience — clean, immersive, works on any device</p>
          </div>
        </div>
      </section>

      {/* ── World Builder ── */}
      <section id="world-builder" className="px-6 py-20" style={{ background: 'linear-gradient(180deg, #140d2a 0%, #0f0e17 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sword size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Part 3</p>
              <h2 id="world-builder-heading" className="text-2xl sm:text-3xl font-extrabold text-white">World Builder</h2>
            </div>
          </div>
          <p className="text-gray-400 mb-3 ml-[52px]">
            Create RPG-style adventures with a living party of heroes, collectible items, and enemy combat. Choose World Builder as your story type when creating a new story.
          </p>
          <div className="ml-[52px] mb-12 flex items-start gap-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 max-w-2xl">
            <Lightbulb size={14} className="text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs text-violet-300 leading-relaxed">World Builder stories use the same node canvas editor as Story Path, with three additional panels in the left sidebar: <strong className="text-white">Characters</strong>, <strong className="text-white">Items</strong>, and <strong className="text-white">Chapters</strong>.</p>
          </div>

          <div className="flex flex-col gap-16">

            {/* Characters */}
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1 flex flex-col gap-8">
                <StepCard number={1} title="Create hero characters" accent="amber" id="wb-heroes">
                  In the <strong className="text-white">Characters</strong> panel, click <Kbd>Add character</Kbd> and set the type to <strong className="text-white">Hero / Party Member</strong>. Heroes have:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Custom attributes</strong> — add any mix of number, boolean, or text attributes (HP, Gold, Strength, etc.)</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Set a <strong className="text-white">default value</strong> and optional min/max for each attribute</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>The party sidebar shown to readers updates live as stats change throughout the story</span></li>
                  </ul>
                </StepCard>
                <StepCard number={2} title="Create foes" accent="amber" id="wb-foes">
                  Add a character and set the type to <strong className="text-white">Foe / Villain</strong>. Foes have dedicated combat stats instead of the attribute system:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">HP</strong> — the foe&apos;s total health in combat</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Damage per round</strong> — how hard they hit back each turn</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Defeat description</strong> — flavor text shown when the party wins</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Emoji icon</strong> — used in the dramatic foe-reveal screen</span></li>
                  </ul>
                  <Callout>Assign a foe to any scene using the <strong>Assign foe</strong> field in the scene editor. Set a <strong>Run Away</strong> destination so readers who flee have somewhere to go.</Callout>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-sm">
                <WorldBuilderCharactersMockup />
              </div>
            </div>

            {/* Items & scene placement */}
            <div className="flex flex-col lg:flex-row-reverse gap-10 items-start">
              <div className="flex-1 flex flex-col gap-8">
                <StepCard number={3} title="Create items" accent="amber" id="wb-items">
                  Switch to the <strong className="text-white">Items</strong> panel and click <Kbd>Add item</Kbd>. Items can serve different roles:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Weapons &amp; abilities</strong> — set a damage value; these appear in the combat action picker</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Potions &amp; buffs</strong> — add stat effects (e.g. +20 HP) that apply when the item is picked up</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Durability</strong> — set a use limit; items become spent when exhausted</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Revival items</strong> — toggle <em>Can revive</em> and set how much HP is restored; readers can use these mid-combat to revive a fallen hero</span></li>
                  </ul>
                </StepCard>
                <StepCard number={4} title="Place items in scenes" accent="amber" id="wb-scene-items">
                  Open any scene in the editor. Use <Kbd>Place item</Kbd> to drop a findable pickup into the scene. Readers who arrive see a pickup prompt — claiming the item adds it to that hero&apos;s inventory. Items and inventory persist across all scenes via the reader&apos;s session.
                  <Callout>You can place the same item in multiple scenes — great for giving different party members a chance to find it on different paths.</Callout>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-sm">
                <WorldBuilderItemsMockup />
              </div>
            </div>

            {/* Choice paths & health */}
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1 flex flex-col gap-8">
                <StepCard number={5} title="Configure choice paths" accent="amber" id="wb-choice-paths">
                  Click any choice arrow on the canvas to open the <strong className="text-white">Choice Editor</strong>. Each choice can have:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Stat effects</strong> — modify any attribute when a reader takes this path (e.g. &ldquo;HP −10 on the dangerous route&rdquo;)</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Conditions</strong> — hide the choice unless an attribute meets a threshold (e.g. &ldquo;show only if Strength ≥ 15&rdquo;)</span></li>
                  </ul>
                  <Callout>Readers who don&apos;t meet a condition simply never see that choice — creating naturally different paths based on how their stats developed.</Callout>
                </StepCard>
                <StepCard number={6} title="Set health and armor attributes" accent="amber" id="wb-health-armor">
                  In the character editor, scroll to the <strong className="text-white">Combat health</strong> panel (visible when the hero has at least one number attribute). Designate:
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Health attribute</strong> — the attribute that drains when the hero takes damage</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span><strong className="text-white">Armor attribute</strong> (optional) — absorbs foe damage first; overflow goes to health</span></li>
                  </ul>
                  When the health attribute reaches its minimum, the hero <strong className="text-white">falls</strong> and is shown with a Fallen badge in the party sidebar.
                </StepCard>
                <StepCard number={7} title="Generate character portraits" accent="amber" id="wb-avatars">
                  Open any character in the editor and click <Kbd><Sparkles size={11} className="inline" /> Generate avatar</Kbd> (requires a monthly subscription). A portrait-style image is generated based on the character&apos;s name and description.
                  <ul className="mt-3 flex flex-col gap-2">
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Hero portraits appear in the party sidebar as readers play</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Foe portraits replace the emoji icon in the dramatic encounter reveal</span></li>
                    <li className="flex items-start gap-2 text-gray-300"><ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" /><span>Save the character first — the generate button is available once a character has been saved</span></li>
                  </ul>
                </StepCard>
              </div>
              <div className="flex-1 w-full max-w-sm sticky top-24">
                <WorldBuilderCombatMockup />
              </div>
            </div>

          </div>

          {/* ── Playing a World Builder Story ── */}
          <div className="mt-20 pt-16 border-t border-white/8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Play size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Reader Experience</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">Playing a World Builder Story</h3>
              </div>
            </div>
            <p className="text-gray-400 mb-10 ml-[52px]">What readers experience when they play a World Builder adventure.</p>
            <div className="flex flex-col gap-5">
              {[
                {
                  n: 1, title: 'Party sidebar', id: 'wb-play-sidebar',
                  body: <>A live stats sidebar appears alongside the story showing every hero&apos;s current attributes — HP, Gold, Strength, and any others you defined. Stats update in real time as readers make choices that have stat effects attached.</>
                },
                {
                  n: 2, title: 'Collecting items', id: 'wb-play-items',
                  body: <>When a reader arrives at a scene with a placed item, a pickup prompt appears at the top of the scene. Clicking it adds the item to that hero&apos;s inventory. Items with on-pickup effects (like &ldquo;+20 HP&rdquo;) apply immediately. Inventory persists across all scenes in the session.</>
                },
                {
                  n: 3, title: 'Foe encounters', id: 'wb-play-foes',
                  body: <>Scenes assigned a foe open with a dramatic reveal — the foe&apos;s icon or portrait, name, and lore. Readers choose to fight or flee. In combat:<br /><br />
                    <strong className="text-white">1.</strong> Select a party member to fight.<br />
                    <strong className="text-white">2.</strong> Select a weapon or ability from their inventory.<br />
                    <strong className="text-white">3.</strong> Attack — the hero deals damage, then the foe counterattacks.<br />
                    <strong className="text-white">4.</strong> Repeat until the foe is defeated or the reader flees to the Run Away scene.
                  </>
                },
                {
                  n: 4, title: 'Fallen heroes and revival', id: 'wb-play-fallen',
                  body: <>When a hero&apos;s health hits its minimum they fall — shown with a red <strong className="text-white">Fallen</strong> badge in the party sidebar. Fallen heroes can&apos;t be selected to attack. If any party member holds a revival item, a <strong className="text-white">Revive</strong> tab appears in the combat action picker to bring them back with a configurable amount of HP restored.</>
                },
                {
                  n: 5, title: 'Game over', id: 'wb-play-gameover',
                  body: <>If all heroes fall simultaneously, the story ends with a full-screen game-over screen showing each fallen hero and an encouraging message. Readers click <strong className="text-white">Try Again</strong> to reset all stats and inventory and return to the very first scene — or <strong className="text-white">Back to home</strong> to exit.</>
                },
              ].map(({ n, title, id, body }) => (
                <StepCard key={n} number={n} title={title} accent="amber" id={id}>
                  {body}
                </StepCard>
              ))}
            </div>
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
              <h2 id="tips-and-tricks" className="text-2xl sm:text-3xl font-extrabold text-white">Tips &amp; Tricks</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: BookMarked, tip: 'Every new story starts with Chapter 1 already created — just start adding scenes.' },
              { icon: GitBranch, tip: 'Use a "Next Chapter" scene at the end of each chapter to chain them together.' },
              { icon: CheckCircle2, tip: 'Scenes marked Done are highlighted on the canvas so you can track writing progress at a glance.' },
              { icon: MousePointerClick, tip: 'Drag scenes freely to rearrange the canvas — positions are saved automatically.' },
              { icon: Sparkles, tip: 'Scene images respect your audience setting — Adults Only stories never depict minors.' },
              { icon: BookOpen, tip: 'The home page shows reachable ending count — a useful measure of story depth.' },
              { icon: Music, tip: 'Scene sounds autoplay when readers arrive. Use ambient tracks to set the mood — readers can pause, adjust volume, or mute globally from the header.' },
              { icon: BookMarked, tip: 'On Next Chapter scenes, set an Entry scene to drop readers into a specific scene in the next chapter based on where their path leads — not just the default Start.' },
              { icon: Shield, tip: 'World Builder: give every hero both a Health and an Armor attribute. Armor absorbs foe damage first — readers feel tanky until it runs out, then the tension spikes.' },
              { icon: Sword, tip: 'World Builder: add at least one weapon or ability to every scene path so readers always have something to fight with when they hit a foe encounter.' },
              { icon: Heart, tip: 'World Builder: place a revival item somewhere early in the story so readers who lose a hero can still recover — an unwinnable combat feels unfair, a narrow escape feels epic.' },
              { icon: Zap, tip: 'World Builder: use stat conditions on choices (e.g. "show only if Strength ≥ 15") to reward readers who took difficult earlier paths — it makes replays feel meaningfully different.' },
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
          <p className="text-gray-500 text-base mb-2 max-w-lg mx-auto">
            Have your first branching story live in minutes.
          </p>
          <p className="text-gray-400 text-sm mb-10">From {minPrice}. Cancel anytime.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-900 bg-amber-500 hover:bg-amber-600 shadow-lg transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
              <Plus size={16} />
              Get started
            </Link>
            <Link href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
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

function StepCard({ number, title, accent, id, children }: { number: number; title: string; accent: 'amber' | 'light'; id?: string; children: React.ReactNode }) {
  const dark = accent === 'amber'
  return (
    <div className={`rounded-2xl border p-6 ${dark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold text-gray-900 shrink-0">
          {number}
        </div>
        <h3 id={id} className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
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

function ChaptersMockup() {
  return (
    <div aria-hidden="true" className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Chapter Navigation</p>
      </div>
      <div className="flex" style={{ minHeight: 220 }}>
        {/* Sidebar */}
        <div className="w-40 shrink-0 border-r border-white/5 flex flex-col" style={{ background: '#0d0c1a' }}>
          <div className="px-3 py-2.5 border-b border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Chapters</p>
          </div>
          <div className="flex flex-col p-2 gap-1 flex-1">
            {[
              { label: 'Chapter 1', active: false, done: true },
              { label: 'Chapter 2', active: true, done: false },
              { label: 'Chapter 3', active: false, done: false },
            ].map(({ label, active, done }) => (
              <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${active ? 'bg-teal-500/15 border border-teal-500/25' : 'hover:bg-white/5'}`}>
                <BookMarked size={10} className={active ? 'text-teal-400' : done ? 'text-white/25' : 'text-white/25'} />
                <span className={`text-xs font-medium truncate ${active ? 'text-teal-300' : 'text-white/35'}`}>{label}</span>
                {done && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400/60 shrink-0" />}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] text-teal-400 border border-teal-500/20 bg-teal-500/10">
              <Plus size={9} /> Add Chapter
            </div>
          </div>
        </div>
        {/* Canvas preview */}
        <div className="flex-1 relative p-4" style={{ background: 'radial-gradient(ellipse at 40% 50%, #1e1b3a 0%, #0f0e17 80%)' }}>
          <div className="absolute top-2 left-4 right-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/25">
              <BookMarked size={9} /> Chapter 2
            </div>
          </div>
          {/* Mini nodes */}
          <div className="absolute top-12 left-6 w-24 rounded-lg border border-green-500/40" style={{ background: '#1a1025' }}>
            <div className="px-2 py-1 border-b border-green-500/20 bg-green-500/10 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-400" />
              <span className="text-[9px] font-semibold text-green-400">Start</span>
            </div>
            <div className="px-2 py-1.5"><p className="text-[9px] text-white/60">The village at dawn…</p></div>
          </div>
          <div className="absolute top-12 left-[142px] w-24 rounded-lg border border-amber-500/30" style={{ background: '#1a1025' }}>
            <div className="px-2 py-1 border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="text-[9px] font-semibold text-amber-400">Scene</span>
            </div>
            <div className="px-2 py-1.5"><p className="text-[9px] text-white/60">The market square…</p></div>
          </div>
          <div className="absolute top-[110px] left-[142px] w-24 rounded-lg border border-teal-400/40" style={{ background: '#1a1025' }}>
            <div className="px-2 py-1 border-b border-teal-400/20 bg-teal-400/10 flex items-center gap-1">
              <BookMarked size={8} className="text-teal-400" />
              <span className="text-[9px] font-semibold text-teal-400">Next Ch.</span>
            </div>
            <div className="px-2 py-1.5"><p className="text-[9px] text-white/50">→ Chapter 3</p></div>
          </div>
          {/* Arrow */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 102 66 C 125 66 130 66 142 66" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.5" markerEnd="url(#ch-arrow)" />
            <defs>
              <marker id="ch-arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                <path d="M 0 0 L 5 2.5 L 0 5 Z" fill="#f59e0b" opacity="0.7" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}

function WorldBuilderCharactersMockup() {
  return (
    <div aria-hidden="true" className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Characters Panel</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {/* Hero card */}
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/8 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-violet-500/30 text-violet-300 text-xs font-bold flex items-center justify-center shrink-0">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-violet-200">Aldric</p>
              <p className="text-[10px] text-violet-400/60">Hero · Party Member</p>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20">Hero</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">❤ HP 100/100</span>
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">🛡 Armor 40</span>
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">⚡ STR 12</span>
          </div>
        </div>
        {/* Foe card */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/8 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-red-500/20 text-lg flex items-center justify-center shrink-0">🐉</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-200">Cave Drake</p>
              <p className="text-[10px] text-red-400/60">Foe / Villain</p>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">Foe</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">❤ HP 80</span>
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">⚔ 15 dmg/rd</span>
          </div>
        </div>
        {/* Add button */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400">
          <Plus size={11} /> Add character
        </div>
      </div>
    </div>
  )
}

function WorldBuilderItemsMockup() {
  return (
    <div aria-hidden="true" className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Items Panel</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {/* Weapon */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-base shrink-0">⚔️</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-200">Iron Sword</p>
              <p className="text-[10px] text-amber-400/60">Weapon</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">⚔ 25 damage</span>
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">∞ uses</span>
          </div>
        </div>
        {/* Potion */}
        <div className="rounded-xl border border-green-500/30 bg-green-500/8 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center text-base shrink-0">🧪</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-200">Healing Potion</p>
              <p className="text-[10px] text-green-400/60">Consumable · Can revive</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">❤ +30 HP on pickup</span>
            <span className="text-[9px] bg-white/5 border border-white/8 text-white/50 px-1.5 py-0.5 rounded-full">3 uses</span>
            <span className="text-[9px] bg-green-500/15 border border-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">✦ Revives</span>
          </div>
        </div>
        {/* Add button */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
          <Plus size={11} /> Add item
        </div>
      </div>
    </div>
  )
}

function WorldBuilderCombatMockup() {
  return (
    <div aria-hidden="true" className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Foe Encounter</p>
      </div>
      <div className="p-4">
        {/* Foe reveal */}
        <div className="text-center mb-4 pb-4 border-b border-white/5">
          <div className="text-4xl mb-2">🐉</div>
          <p className="text-sm font-bold text-red-300">Cave Drake</p>
          <p className="text-[10px] text-white/40 mt-0.5 leading-snug max-w-[180px] mx-auto">A fire-breathing drake guards the ancient tomb…</p>
          {/* HP bar */}
          <div className="mt-3 mx-auto max-w-[160px]">
            <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>HP</span><span>60 / 80</span></div>
            <div className="w-full h-2 rounded-full bg-white/8">
              <div className="h-full rounded-full bg-red-500" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
        {/* Combat controls */}
        <div className="flex flex-col gap-2.5">
          <div>
            <p className="text-[10px] text-white/30 mb-1">Select hero</p>
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-violet-500/15 border border-violet-500/25">
              <div className="w-5 h-5 rounded-full bg-violet-500/30 text-violet-300 text-[9px] font-bold flex items-center justify-center">A</div>
              <span className="text-xs text-violet-200 font-medium">Aldric</span>
              <span className="ml-auto text-[9px] text-violet-400/60">HP 85/100</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/30 mb-1">Select weapon / ability</p>
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-amber-500/12 border border-amber-500/25">
              <span className="text-sm">⚔️</span>
              <span className="text-xs text-amber-200 font-medium">Iron Sword</span>
              <span className="ml-auto text-[9px] text-amber-400/70">25 dmg</span>
            </div>
          </div>
          <button className="w-full py-2 rounded-lg text-xs font-bold text-white bg-red-600/80 border border-red-500/40 mt-1">
            ⚔ Attack
          </button>
        </div>
      </div>
    </div>
  )
}

function AiImageMockup() {
  return (
    <div aria-hidden="true" className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0f0e17' }}>
      <div className="px-4 py-3 border-b border-white/5" style={{ background: '#16142a' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Scene Image</p>
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
              <div className="w-8 h-8 rounded-full border-2 border-amber-400/60 border-t-amber-400 motion-safe:animate-spin" />
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
        <p className="text-xs text-white/30 text-center mt-3">A cinematic illustration generated from your scene content</p>
      </div>
    </div>
  )
}
