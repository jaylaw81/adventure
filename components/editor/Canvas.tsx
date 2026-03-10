'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node as RFNode,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type OnEdgesDelete,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, Pencil, Trash2, BookMarked, Check, X, ChevronRight } from 'lucide-react'

import StoryNode, { type StoryNodeData } from './StoryNode'
import EditableEdge from './EditableEdge'
import NodeEditor from './NodeEditor'
import Toolbar from './Toolbar'
import AdventureSettingsModal from '@/components/shared/AdventureSettingsModal'
import type { Node, Choice, Adventure, Chapter } from '@/lib/schema'
import type { AdventureWithCounts } from '@/lib/queries'
import { analytics } from '@/lib/analytics'

const nodeTypes = { storyNode: StoryNode }
const edgeTypes = { editableEdge: EditableEdge }

function toRFNode(node: Node): RFNode {
  return {
    id: node.id,
    type: 'storyNode',
    position: { x: node.positionX, y: node.positionY },
    data: {
      title: node.title,
      content: node.content,
      nodeType: node.nodeType,
      status: node.status ?? 'in_progress',
    } as StoryNodeData,
  }
}

function toRFEdge(
  choice: Choice,
  onLabelChange: (edgeId: string, label: string) => void,
  onDelete: (edgeId: string) => void,
): Edge {
  return {
    id: choice.id,
    source: choice.sourceNodeId,
    target: choice.targetNodeId,
    type: 'editableEdge',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    style: { stroke: '#f59e0b', strokeWidth: 2 },
    data: {
      label: choice.label,
      adventureId: choice.adventureId,
      onLabelChange,
      onDelete,
    },
  }
}

interface Props {
  adventure: Adventure
  initialNodes: Node[]
  initialChoices: Choice[]
  initialChapters: Chapter[]
}

/* ── Chapter sidebar ──────────────────────────────────────────────── */

interface ChapterSidebarProps {
  chapters: Chapter[]
  activeChapterId: string | null
  onSelect: (id: string | null) => void
  onAdd: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

function ChapterSidebar({ chapters, activeChapterId, onSelect, onAdd, onRename, onDelete }: ChapterSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (ch: Chapter) => {
    setEditingId(ch.id)
    setEditValue(ch.title)
  }

  const commitEdit = (id: string) => {
    if (editValue.trim()) onRename(id, editValue.trim())
    setEditingId(null)
  }

  return (
    <div className="w-52 shrink-0 h-full bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked size={14} className="text-teal-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Chapters</span>
        </div>
        <button
          onClick={onAdd}
          title="Add chapter"
          className="w-6 h-6 rounded-md bg-teal-500 hover:bg-teal-400 text-white flex items-center justify-center transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {/* "All scenes" entry — shown when no chapters yet or for overview */}
        {chapters.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">No chapters yet. Add a chapter to organise your story into sections.</p>
          </div>
        )}

        {chapters.map((ch, i) => {
          const active = activeChapterId === ch.id
          return (
            <div
              key={ch.id}
              className={`group flex items-center gap-1 mx-2 mb-0.5 rounded-lg px-2 py-2 cursor-pointer transition-colors ${
                active ? 'bg-teal-600/30 text-teal-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              onClick={() => { if (editingId !== ch.id) onSelect(ch.id) }}
            >
              <span className={`text-xs font-bold shrink-0 w-5 ${active ? 'text-teal-400' : 'text-slate-600'}`}>
                {i + 1}
              </span>

              {editingId === ch.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(ch.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit(ch.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 text-xs bg-slate-700 text-white rounded px-1.5 py-0.5 outline-none min-w-0"
                />
              ) : (
                <span className="flex-1 text-xs font-medium truncate">{ch.title}</span>
              )}

              {active && editingId !== ch.id && (
                <ChevronRight size={12} className="text-teal-400 shrink-0" />
              )}

              {editingId !== ch.id && (
                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); startEdit(ch) }}
                    className="p-0.5 hover:text-white rounded transition-colors"
                    title="Rename"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(ch.id) }}
                    className="p-0.5 hover:text-red-400 rounded transition-colors"
                    title="Delete chapter"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {activeChapterId && (
        <div className="px-3 py-3 border-t border-slate-700">
          <button
            onClick={() => onSelect(null)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Check size={12} />
            View all scenes
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Canvas inner ─────────────────────────────────────────────────── */

function CanvasInner({ adventure, initialNodes, initialChoices, initialChapters }: Props) {
  const { screenToFlowPosition } = useReactFlow()
  const [dbNodes, setDbNodes] = useState<Node[]>(initialNodes)
  const [dbChapters, setDbChapters] = useState<Chapter[]>(initialChapters)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    initialChapters.length > 0 ? initialChapters[0].id : null
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentAdventure, setCurrentAdventure] = useState(adventure)
  const [nodeEditorDirty, setNodeEditorDirty] = useState(false)
  const externalSaveRef = useRef<(() => Promise<void>) | null>(null)

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!nodeEditorDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [nodeEditorDirty])

  const confirmDiscard = useCallback(() => {
    if (!nodeEditorDirty) return true
    return confirm('You have unsaved changes. Discard them?')
  }, [nodeEditorDirty])

  const handleLabelChange = useCallback(async (edgeId: string, label: string) => {
    setRfEdges(prev =>
      prev.map(e => e.id === edgeId ? { ...e, data: { ...e.data, label } } : e)
    )
    await fetch(`/api/adventures/${adventure.id}/choices/${edgeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
  }, [adventure.id])

  const handleEdgeDelete = useCallback(async (edgeId: string) => {
    setRfEdges(prev => prev.filter(e => e.id !== edgeId))
    await fetch(`/api/adventures/${adventure.id}/choices/${edgeId}`, { method: 'DELETE' })
    analytics.choiceDeleted(adventure.id)
  }, [adventure.id])

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes.map(toRFNode))
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    initialChoices.map(c => toRFEdge(c, handleLabelChange, handleEdgeDelete))
  )

  // Filter visible nodes/edges by active chapter
  const visibleNodeIds = activeChapterId
    ? new Set(dbNodes.filter(n => n.chapterId === activeChapterId).map(n => n.id))
    : new Set(dbNodes.map(n => n.id))

  const visibleRfNodes = rfNodes.filter(n => visibleNodeIds.has(n.id))
  const visibleRfEdges = rfEdges.filter(e =>
    visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  )

  const selectedDbNode = dbNodes.find(n => n.id === selectedNodeId) ?? null

  const onConnect = useCallback(
    async (connection: Connection) => {
      const label = prompt('Choice text:', 'Continue') ?? 'Continue'
      const res = await fetch(`/api/adventures/${adventure.id}/choices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceNodeId: connection.source,
          targetNodeId: connection.target,
          label,
        }),
      })
      const choice: Choice = await res.json()
      analytics.choiceCreated(adventure.id)
      setRfEdges(eds => addEdge(toRFEdge(choice, handleLabelChange, handleEdgeDelete), eds))
    },
    [adventure.id, handleLabelChange, handleEdgeDelete]
  )

  const onEdgesDelete: OnEdgesDelete = useCallback(
    async (deletedEdges) => {
      for (const edge of deletedEdges) {
        await fetch(`/api/adventures/${adventure.id}/choices/${edge.id}`, { method: 'DELETE' })
      }
    },
    [adventure.id]
  )

  const onNodeClick: NodeMouseHandler = useCallback((_evt, rfNode) => {
    if (rfNode.id === selectedNodeId) return
    if (!confirmDiscard()) return
    setNodeEditorDirty(false)
    setSelectedNodeId(rfNode.id)
  }, [selectedNodeId, confirmDiscard])

  const handlePaneClick = useCallback(() => {
    if (!selectedNodeId) return
    if (!confirmDiscard()) return
    setNodeEditorDirty(false)
    setSelectedNodeId(null)
  }, [selectedNodeId, confirmDiscard])

  const onNodeDragStop: NodeMouseHandler = useCallback(
    async (_evt, node) => {
      await fetch(`/api/adventures/${adventure.id}/nodes/${node.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionX: node.position.x, positionY: node.position.y }),
      })
    },
    [adventure.id]
  )

  const handleAddNode = async () => {
    if (!confirmDiscard()) return
    setNodeEditorDirty(false)

    const canvasEl = document.querySelector('.react-flow__renderer') as HTMLElement | null
    const rect = canvasEl?.getBoundingClientRect() ?? { left: 0, top: 0, width: 800, height: 600 }
    const position = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

    const res = await fetch(`/api/adventures/${adventure.id}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Scene',
        content: '',
        nodeType: 'scene',
        positionX: position.x,
        positionY: position.y,
        chapterId: activeChapterId ?? null,
      }),
    })
    const node: Node = await res.json()
    analytics.sceneAdded(adventure.id)
    setDbNodes(prev => [...prev, node])
    setRfNodes(prev => [...prev, toRFNode(node)])
    setSelectedNodeId(node.id)
  }

  // ── Chapter handlers ──────────────────────────────────────────────

  const handleAddChapter = async () => {
    const title = prompt('Chapter name:', `Chapter ${dbChapters.length + 1}`)
    if (!title) return
    const res = await fetch(`/api/adventures/${adventure.id}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const { chapter, startNode }: { chapter: Chapter; startNode: Node } = await res.json()
    setDbChapters(prev => [...prev, chapter])
    setDbNodes(prev => [...prev, startNode])
    setRfNodes(prev => [...prev, toRFNode(startNode)])
    setActiveChapterId(chapter.id)
    setSelectedNodeId(startNode.id)
  }

  const handleRenameChapter = async (chapterId: string, title: string) => {
    await fetch(`/api/adventures/${adventure.id}/chapters/${chapterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setDbChapters(prev => prev.map(c => c.id === chapterId ? { ...c, title } : c))
  }

  const handleDeleteChapter = async (chapterId: string) => {
    const chapter = dbChapters.find(c => c.id === chapterId)
    if (!confirm(`Delete "${chapter?.title ?? 'this chapter'}"? The chapter's scenes will become unassigned.`)) return
    await fetch(`/api/adventures/${adventure.id}/chapters/${chapterId}`, { method: 'DELETE' })
    setDbChapters(prev => prev.filter(c => c.id !== chapterId))
    // Unassign chapterId from affected nodes locally
    setDbNodes(prev => prev.map(n => n.chapterId === chapterId ? { ...n, chapterId: null } : n))
    if (activeChapterId === chapterId) {
      const remaining = dbChapters.filter(c => c.id !== chapterId)
      setActiveChapterId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const handleSelectChapter = (id: string | null) => {
    if (!confirmDiscard()) return
    setNodeEditorDirty(false)
    setSelectedNodeId(null)
    setActiveChapterId(id)
  }

  // ── Node update / delete ──────────────────────────────────────────

  const handleToolbarSave = useCallback(async () => {
    if (externalSaveRef.current) {
      setSaving(true)
      await externalSaveRef.current()
      setSaving(false)
    }
  }, [])

  const handleNodeUpdate = (updated: Node) => {
    setDbNodes(prev => prev.map(n => (n.id === updated.id ? updated : n)))
    setRfNodes(prev =>
      prev.map(n =>
        n.id === updated.id
          ? { ...n, data: { title: updated.title, content: updated.content, nodeType: updated.nodeType, status: updated.status ?? 'in_progress' } }
          : n
      )
    )
  }

  const handleNodeDelete = (nodeId: string) => {
    setDbNodes(prev => prev.filter(n => n.id !== nodeId))
    setRfNodes(prev => prev.filter(n => n.id !== nodeId))
    setRfEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId))
  }

  const hasChapters = dbChapters.length > 0

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        adventureTitle={currentAdventure.title}
        adventureId={currentAdventure.id}
        onAddNode={handleAddNode}
        onSave={handleToolbarSave}
        onSettings={() => setShowSettings(true)}
        saving={saving}
        dirty={nodeEditorDirty}
      />
      <div className="flex flex-1 overflow-hidden">

        {/* Chapter sidebar */}
        {hasChapters && (
          <ChapterSidebar
            chapters={dbChapters}
            activeChapterId={activeChapterId}
            onSelect={handleSelectChapter}
            onAdd={handleAddChapter}
            onRename={handleRenameChapter}
            onDelete={handleDeleteChapter}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          {/* Chapter header badge */}
          {activeChapterId && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-teal-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none">
              <BookMarked size={12} />
              {dbChapters.find(c => c.id === activeChapterId)?.title ?? 'Chapter'}
            </div>
          )}

          {/* Add first chapter prompt */}
          {!hasChapters && (
            <div className="absolute bottom-6 left-6 z-10">
              <button
                onClick={handleAddChapter}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold shadow-lg transition-colors"
              >
                <BookMarked size={15} />
                Add Chapter
              </button>
            </div>
          )}

          <ReactFlow
            nodes={visibleRfNodes}
            edges={visibleRfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode="Delete"
          >
            <Background gap={20} color="#e5e7eb" />
            <Controls />
            <MiniMap nodeColor={n => {
              const t = (n.data as StoryNodeData).nodeType
              if (t === 'chapter_end') return '#2dd4bf'
              const status = (n.data as StoryNodeData).status ?? 'in_progress'
              return status === 'completed' ? '#fca5a5' : '#93c5fd'
            }} />
          </ReactFlow>
        </div>

        {selectedDbNode && (
          <NodeEditor
            node={selectedDbNode}
            adventureId={adventure.id}
            chapters={dbChapters}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
            onDirtyChange={setNodeEditorDirty}
            externalSaveRef={externalSaveRef}
          />
        )}
      </div>

      {showSettings && (
        <AdventureSettingsModal
          adventure={currentAdventure as AdventureWithCounts}
          onClose={() => setShowSettings(false)}
          onSave={updated => setCurrentAdventure(prev => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  )
}

export default function Canvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
