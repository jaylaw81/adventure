'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, RotateCcw, Pencil } from 'lucide-react'
import { demoLoad, demoReset } from '@/lib/demo-store'
import type { Node, Choice } from '@/lib/schema'



const CHOICE_EMOJIS = ['❤️', '👍', '🔥']

interface DemoState {
  nodes: Node[]
  choices: Choice[]
}

function SceneDisplay({ node }: { node: Node }) {
  return (
    <div className="max-w-2xl mx-auto">
      {node.imageUrl && (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={node.imageUrl} alt={node.title || 'Scene illustration'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            {node.nodeType === 'start' && (
              <span className="px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full font-medium">Start</span>
            )}
            {node.nodeType === 'ending' && (
              <span className="px-2 py-0.5 bg-purple-500/90 text-white text-xs rounded-full font-medium">Ending</span>
            )}
          </div>
        </div>
      )}

      {!node.imageUrl && (
        <div className="mb-2 flex items-center gap-2">
          {node.nodeType === 'start' && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Start</span>
          )}
          {node.nodeType === 'ending' && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Ending</span>
          )}
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{node.title || 'Untitled Scene'}</h1>
      <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
        {node.content || <em className="text-gray-400">No content written yet.</em>}
      </div>
    </div>
  )
}

function DemoPlayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [story, setStory] = useState<DemoState | null>(null)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)

  useEffect(() => {
    const loaded = demoLoad()
    setStory(loaded)
    const paramNode = searchParams.get('node')
    const startNode = loaded.nodes.find(n => n.nodeType === 'start') ?? loaded.nodes[0]
    if (paramNode && loaded.nodes.find(n => n.id === paramNode)) {
      setCurrentNodeId(paramNode)
    } else {
      setCurrentNodeId(startNode?.id ?? null)
    }
  }, [searchParams])

  if (!story || !currentNodeId) {
    return <div className="text-center py-20 text-gray-400">Loading…</div>
  }

  const node = story.nodes.find(n => n.id === currentNodeId)
  if (!node) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Scene not found.</p>
        <Link href="/demo/play" className="text-amber-600 hover:underline">Start from the beginning</Link>
      </div>
    )
  }

  const choices = story.choices
    .filter(c => c.sourceNodeId === currentNodeId)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const isStart = node.nodeType === 'start'
  const isEnding = node.nodeType === 'ending'

  const navigateTo = (nodeId: string) => {
    router.push(`/demo/play?node=${nodeId}`)
  }

  const handleReset = () => {
    if (!confirm('Reset the demo to its original state? All your edits will be lost.')) return
    demoReset()
    router.push('/demo/play')
  }

  return (
    <div className="flex flex-col flex-1" style={{ background: 'linear-gradient(135deg, #fafaf7 0%, #fff8f0 100%)' }}>

      {/* Demo banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between gap-4 flex-wrap text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 rounded px-1.5 py-0.5 font-bold tracking-wide">DEMO</span>
          <span>Playing your locally saved story — changes from the editor are reflected here.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <RotateCcw size={11} />
            Reset
          </button>
          <Link href="/sign-up" className="flex items-center gap-1 px-2.5 py-1 bg-white text-amber-600 hover:bg-amber-50 rounded-lg font-semibold transition-colors">
            Create free account →
          </Link>
        </div>
      </div>

      {/* Scene nav row */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100 bg-white/70">
        {!isStart ? (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        ) : <div />}
        <Link
          href="/demo"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Pencil size={12} />
          Edit story
        </Link>
      </div>

      {/* Scene */}
      <main className="flex-1 px-6 py-10">
        <SceneDisplay node={node} />

        {/* Choices / Ending */}
        <div className="max-w-2xl mx-auto mt-10">
          {isEnding ? (
            <div className="text-center">
              <p className="text-gray-400 italic text-lg mb-6">— The End —</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => {
                    const startNode = story.nodes.find(n => n.nodeType === 'start') ?? story.nodes[0]
                    if (startNode) router.push(`/demo/play?node=${startNode.id}`)
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <RotateCcw size={16} />
                  Play Again
                </button>
                <Link
                  href="/sign-up"
                  className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
                >
                  Create your own story →
                </Link>
              </div>
            </div>
          ) : choices.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">No choices connected to this scene yet.</p>
              <Link href="/demo" className="text-amber-600 hover:underline text-sm">
                Go back to the editor to add some →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">What do you do?</p>
              {choices.map((choice, i) => (
                <button
                  key={choice.id}
                  onClick={() => navigateTo(choice.targetNodeId)}
                  className="flex items-center justify-between w-full px-5 py-4 bg-white border-2 border-amber-200 rounded-xl text-gray-800 font-medium hover:bg-amber-50 hover:border-amber-400 transition-all group shadow-sm text-left"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{CHOICE_EMOJIS[i] ?? '▶️'}</span>
                    {choice.label}
                  </span>
                  <ChevronRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  )
}

export default function DemoPlayPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
      <DemoPlayContent />
    </Suspense>
  )
}
