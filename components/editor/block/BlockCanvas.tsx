'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ArrowLeft, Settings, Layers } from 'lucide-react'
import Link from 'next/link'
import type { Node, Choice, Adventure, Chapter } from '@/lib/schema'
import type { AdventureWithCounts } from '@/lib/queries'
import SceneBlock from './SceneBlock'
import BlockPalette from './BlockPalette'
import BlockSidebar from './BlockSidebar'
import AdventureSettingsModal from '@/components/shared/AdventureSettingsModal'
import PublishStatusButton from '@/components/editor/PublishStatusButton'

interface Props {
  adventure: Adventure & { nodes: Node[]; choices: Choice[]; chapters: Chapter[] }
  initialNodes: Node[]
  initialChoices: Choice[]
}

export default function BlockCanvas({ adventure, initialNodes, initialChoices }: Props) {
  const [blocks, setBlocks] = useState<Node[]>(() =>
    [...initialNodes].sort((a, b) => a.positionY - b.positionY)
  )
  const [allChoices, setAllChoices] = useState<Choice[]>(initialChoices)
  const [adding, setAdding] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [adventureTitle, setAdventureTitle] = useState(adventure.title)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setBlocks(prev => {
      const oldIndex = prev.findIndex(b => b.id === active.id)
      const newIndex = prev.findIndex(b => b.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      reordered.forEach((block, i) => {
        const newY = i * 300
        if (block.positionY !== newY) {
          fetch(`/api/adventures/${adventure.id}/nodes/${block.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ positionX: 0, positionY: newY }),
          })
        }
      })
      return reordered.map((block, i) => ({ ...block, positionY: i * 300 }))
    })
  }

  async function handleAddBlock(nodeType: 'scene' | 'ending') {
    if (adding) return
    setAdding(true)
    const maxY = blocks.reduce((m, b) => Math.max(m, b.positionY), -300)
    try {
      const res = await fetch(`/api/adventures/${adventure.id}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeType,
          title: nodeType === 'ending' ? 'The End' : 'New Scene',
          content: '',
          positionX: 0,
          positionY: maxY + 300,
        }),
      })
      if (res.ok) {
        const node = await res.json()
        setBlocks(prev => [...prev, node])
        // Scroll to new block after render
        setTimeout(() => {
          document.getElementById(`block-${node.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteBlock(nodeId: string) {
    await fetch(`/api/adventures/${adventure.id}/nodes/${nodeId}`, { method: 'DELETE' })
    setBlocks(prev => prev.filter(b => b.id !== nodeId))
    setAllChoices(prev => prev.filter(c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId))
    if (selectedBlockId === nodeId) setSelectedBlockId(null)
  }

  function handleBlockUpdate(updated: Partial<Node> & { id: string }) {
    setBlocks(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b))
  }

  async function handleChoiceAdd(sourceNodeId: string) {
    const defaultTarget = blocks.find(b => b.id !== sourceNodeId)
    if (!defaultTarget) return
    const res = await fetch(`/api/adventures/${adventure.id}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceNodeId,
        targetNodeId: defaultTarget.id,
        label: 'Continue',
        orderIndex: allChoices.filter(c => c.sourceNodeId === sourceNodeId).length,
      }),
    })
    if (res.ok) {
      const choice = await res.json()
      setAllChoices(prev => [...prev, choice])
    }
  }

  function handleChoiceUpdate(updated: Choice) {
    setAllChoices(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function handleChoiceDelete(choiceId: string) {
    await fetch(`/api/adventures/${adventure.id}/choices/${choiceId}`, { method: 'DELETE' })
    setAllChoices(prev => prev.filter(c => c.id !== choiceId))
  }

  const sceneCount = blocks.filter(b => b.nodeType === 'scene').length
  const endingCount = blocks.filter(b => b.nodeType === 'ending').length

  return (
    <div className="flex flex-col h-screen bg-slate-100">

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-2 min-w-0">
          <Layers size={15} className="text-indigo-500 shrink-0" />
          <span className="font-semibold text-gray-800 truncate">{adventureTitle}</span>
        </div>
        <span className="hidden sm:block text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 font-semibold shrink-0">
          Block Builder
        </span>
        <div className="ml-auto flex items-center gap-2">
          <PublishStatusButton
            adventureId={adventure.id}
            initialStatus={adventure.status ?? 'active'}
            initialIsPublic={adventure.isPublic}
          />
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Workspace */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            {blocks.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <Layers size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium mb-1">No blocks yet</p>
                <p className="text-xs">Add a Scene or Ending from the bar below.</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-4">
                    {blocks.map(block => (
                      <div key={block.id} id={`block-${block.id}`}>
                        <SceneBlock
                          block={block}
                          choices={allChoices}
                          allBlocks={blocks}
                          adventureId={adventure.id}
                          isSelected={selectedBlockId === block.id}
                          isStorybook={adventure.storyType === 'storybook'}
                          onSelect={() => setSelectedBlockId(block.id)}
                          onBlockUpdate={handleBlockUpdate}
                          onBlockDelete={handleDeleteBlock}
                          onChoiceAdd={handleChoiceAdd}
                          onChoiceUpdate={handleChoiceUpdate}
                          onChoiceDelete={handleChoiceDelete}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            <div className="h-24" />
          </div>
        </div>

        {/* Right sidebar — shows when a block is selected */}
        {selectedBlockId && (() => {
          const selectedBlock = blocks.find(b => b.id === selectedBlockId)
          if (!selectedBlock) return null
          return (
            <BlockSidebar
              block={selectedBlock}
              adventureId={adventure.id}
              storyType={adventure.storyType}
              onClose={() => setSelectedBlockId(null)}
              onBlockUpdate={handleBlockUpdate}
            />
          )
        })()}
      </div>

      {/* Add block bar — docked to the bottom so it's always reachable, no scrolling needed */}
      <BlockPalette
        onAddScene={() => handleAddBlock('scene')}
        onAddEnding={() => handleAddBlock('ending')}
        sceneCount={sceneCount}
        endingCount={endingCount}
        loading={adding}
      />

      {showSettings && (
        <AdventureSettingsModal
          adventure={adventure as unknown as AdventureWithCounts}
          onClose={() => setShowSettings(false)}
          onSave={updated => {
            if (updated.title) setAdventureTitle(updated.title)
            if (updated.editorMode && updated.editorMode !== adventure.editorMode) {
              window.location.reload()
            }
          }}
        />
      )}
    </div>
  )
}
