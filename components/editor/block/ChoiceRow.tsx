'use client'

import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import type { Choice, Node } from '@/lib/schema'

interface Props {
  choice: Choice
  otherBlocks: Node[]
  adventureId: string
  onUpdate: (updated: Choice) => void
  onDelete: () => void
}

export default function ChoiceRow({ choice, otherBlocks, adventureId, onUpdate, onDelete }: Props) {
  const [label, setLabel] = useState(choice.label)

  async function saveLabel() {
    const trimmed = label.trim()
    if (!trimmed || trimmed === choice.label) { setLabel(choice.label); return }
    const res = await fetch(`/api/adventures/${adventureId}/choices/${choice.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: trimmed }),
    })
    if (res.ok) onUpdate(await res.json())
  }

  async function changeTarget(targetNodeId: string) {
    if (!targetNodeId) return
    const res = await fetch(`/api/adventures/${adventureId}/choices/${choice.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetNodeId }),
    })
    if (res.ok) onUpdate(await res.json())
  }

  const target = otherBlocks.find(b => b.id === choice.targetNodeId)
  const targetColor = !target
    ? 'text-red-400'
    : target.nodeType === 'ending'
      ? 'text-purple-600'
      : target.nodeType === 'start'
        ? 'text-green-600'
        : 'text-indigo-600'

  return (
    <div className="flex items-center gap-2 group">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        onBlur={saveLabel}
        placeholder="Choice text..."
        className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
      />
      <ArrowRight size={14} className="text-gray-400 shrink-0" />
      <select
        value={choice.targetNodeId}
        onChange={e => changeTarget(e.target.value)}
        className={`text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white min-w-0 w-36 font-medium truncate ${targetColor}`}
      >
        {!target && <option value="">Select scene...</option>}
        {otherBlocks.map(b => (
          <option key={b.id} value={b.id} className="text-gray-800 font-normal">
            {b.title || (b.nodeType === 'ending' ? 'Untitled Ending' : 'Untitled Scene')}
          </option>
        ))}
      </select>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all shrink-0"
        title="Remove choice"
      >
        <X size={14} />
      </button>
    </div>
  )
}
