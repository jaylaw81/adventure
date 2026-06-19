'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus, BookOpen, Flag, Sparkles, SlidersHorizontal } from 'lucide-react'
import type { Node, Choice } from '@/lib/schema'
import ChoiceRow from './ChoiceRow'

const TYPE_CONFIG = {
  start: {
    label: 'Story Start',
    headerBg: 'bg-green-500',
    bodyBg: 'bg-green-50',
    ring: 'focus:ring-green-400',
    chipBg: 'bg-green-100',
    chipText: 'text-green-700',
    addBtn: 'text-green-600 hover:text-green-700',
    selectedRing: 'ring-2 ring-green-400',
    icon: Sparkles,
  },
  scene: {
    label: 'Scene',
    headerBg: 'bg-indigo-500',
    bodyBg: 'bg-indigo-50',
    ring: 'focus:ring-indigo-400',
    chipBg: 'bg-indigo-100',
    chipText: 'text-indigo-700',
    addBtn: 'text-indigo-600 hover:text-indigo-700',
    selectedRing: 'ring-2 ring-indigo-400',
    icon: BookOpen,
  },
  ending: {
    label: 'The End',
    headerBg: 'bg-purple-500',
    bodyBg: 'bg-purple-50',
    ring: 'focus:ring-purple-400',
    chipBg: 'bg-purple-100',
    chipText: 'text-purple-700',
    addBtn: 'text-purple-600 hover:text-purple-700',
    selectedRing: 'ring-2 ring-purple-400',
    icon: Flag,
  },
  chapter_end: {
    label: 'Chapter End',
    headerBg: 'bg-teal-500',
    bodyBg: 'bg-teal-50',
    ring: 'focus:ring-teal-400',
    chipBg: 'bg-teal-100',
    chipText: 'text-teal-700',
    addBtn: 'text-teal-600 hover:text-teal-700',
    selectedRing: 'ring-2 ring-teal-400',
    icon: BookOpen,
  },
} as const

interface Props {
  block: Node
  choices: Choice[]
  allBlocks: Node[]
  adventureId: string
  isSelected: boolean
  onSelect: () => void
  onBlockUpdate: (updated: Partial<Node> & { id: string }) => void
  onBlockDelete: (id: string) => void
  onChoiceAdd: (sourceNodeId: string) => void
  onChoiceUpdate: (updated: Choice) => void
  onChoiceDelete: (choiceId: string) => void
}

export default function SceneBlock({
  block,
  choices,
  allBlocks,
  adventureId,
  isSelected,
  onSelect,
  onBlockUpdate,
  onBlockDelete,
  onChoiceAdd,
  onChoiceUpdate,
  onChoiceDelete,
}: Props) {
  const [title, setTitle] = useState(block.title)
  const [content, setContent] = useState(block.content)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const cfg = TYPE_CONFIG[block.nodeType as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.scene
  const TypeIcon = cfg.icon
  const isEnding = block.nodeType === 'ending'
  const blockChoices = choices.filter(c => c.sourceNodeId === block.id)
  const otherBlocks = allBlocks.filter(b => b.id !== block.id)
  const canAddChoice = otherBlocks.length > 0

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  async function saveTitle() {
    const trimmed = title.trim()
    if (!trimmed) { setTitle(block.title); return }
    if (trimmed === block.title) return
    const res = await fetch(`/api/adventures/${adventureId}/nodes/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    })
    if (res.ok) {
      const updated = await res.json()
      onBlockUpdate({ id: block.id, title: updated.title })
    }
  }

  async function saveContent() {
    if (content === block.content) return
    const res = await fetch(`/api/adventures/${adventureId}/nodes/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (res.ok) onBlockUpdate({ id: block.id, content })
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white transition-all ${
        isDragging ? 'shadow-2xl' : isSelected ? `${cfg.selectedRing} shadow-md` : 'hover:shadow-md'
      }`}>

        {/* Header */}
        <div className={`${cfg.headerBg} px-4 py-2.5 flex items-center gap-2.5`}>
          <button
            {...attributes}
            {...listeners}
            className="text-white/60 hover:text-white/90 cursor-grab active:cursor-grabbing touch-none transition-colors"
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <div className="flex items-center gap-1.5 flex-1">
            <TypeIcon size={13} className="text-white/90" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">{cfg.label}</span>
          </div>

          {/* Settings button */}
          <button
            onClick={onSelect}
            title="Scene settings"
            className={`transition-colors ${
              isSelected
                ? 'text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-2 ml-1">
              <span className="text-white/80 text-xs">Delete?</span>
              <button
                onClick={() => { onBlockDelete(block.id); setConfirmDelete(false) }}
                className="text-xs bg-white/20 hover:bg-white/40 text-white px-2 py-0.5 rounded font-semibold transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-white/70 hover:text-white transition-colors"
              >
                No
              </button>
            </div>
          ) : block.nodeType !== 'start' ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-white/50 hover:text-white transition-colors ml-0.5"
              title="Delete block"
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-4 flex flex-col gap-3.5">

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
              Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={onSelect}
              onBlur={saveTitle}
              placeholder="Scene title..."
              className={`w-full text-sm font-semibold border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 ${cfg.ring} focus:border-transparent text-gray-900 bg-white transition-colors`}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Story Text
              </label>
              <span className="text-[10px] text-gray-400">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={onSelect}
              onBlur={saveContent}
              placeholder="Write your scene here..."
              rows={5}
              className={`w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${cfg.ring} focus:border-transparent resize-none leading-relaxed text-gray-800 bg-white transition-colors`}
            />
          </div>
        </div>

        {/* Choices section — not shown for endings */}
        {!isEnding && (
          <div className={`border-t border-gray-100 px-5 py-3.5 ${cfg.bodyBg} flex flex-col gap-2.5`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Choices
              </p>
              {blockChoices.length > 0 && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}>
                  {blockChoices.length}
                </span>
              )}
            </div>

            {blockChoices.length === 0 && (
              <p className="text-xs text-gray-400 italic">No choices yet — add one to branch your story.</p>
            )}

            {blockChoices.map(choice => (
              <ChoiceRow
                key={choice.id}
                choice={choice}
                otherBlocks={otherBlocks}
                adventureId={adventureId}
                onUpdate={onChoiceUpdate}
                onDelete={() => onChoiceDelete(choice.id)}
              />
            ))}

            <button
              onClick={() => onChoiceAdd(block.id)}
              disabled={!canAddChoice}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors w-fit mt-0.5 disabled:opacity-40 disabled:cursor-not-allowed ${cfg.addBtn}`}
              title={!canAddChoice ? 'Add more blocks first' : undefined}
            >
              <Plus size={13} />
              Add choice
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
