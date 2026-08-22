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
import { Plus, Pencil, Trash2, BookMarked, Check, X, ChevronRight, GitBranch, BookOpen } from 'lucide-react'

import StoryNode, { type StoryNodeData } from './StoryNode'
import EditableEdge from './EditableEdge'
import NodeEditor from './NodeEditor'
import Toolbar from './Toolbar'
import AddSceneBar from './AddSceneBar'
import AdventureSettingsModal from '@/components/shared/AdventureSettingsModal'
import ConfirmModal from '@/components/shared/ConfirmModal'
import InputModal from './InputModal'
import WorldBuilderPanel from './WorldBuilder/WorldBuilderPanel'
import ChoicePathModal from './WorldBuilder/ChoicePathModal'
import type { Node, Choice, Adventure, Chapter } from '@/lib/schema'
import type { AdventureWithCounts } from '@/lib/queries'
import { analytics } from '@/lib/analytics'
import type { WBCharacter, WorldItem } from '@/lib/worldBuilder'

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
  onChoiceClick?: (edgeId: string) => void,
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
      onChoiceClick,
    },
  }
}

interface Props {
  adventure: Adventure
  initialNodes: Node[]
  initialChoices: Choice[]
  initialChapters: Chapter[]
  initialCharacters?: WBCharacter[]
  initialItems?: WorldItem[]
}

/* ── Chapters nav bar ─────────────────────────────────────────────── */

interface ChaptersNavBarProps {
  chapters: Chapter[]
  activeChapterId: string | null
  onSelect: (id: string | null) => void
  onAdd: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

function ChaptersNavBar({ chapters, activeChapterId, onSelect, onAdd, onRename, onDelete }: ChaptersNavBarProps) {
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
    <div className="w-full shrink-0 bg-slate-900 border-b border-slate-700 flex items-center gap-2 px-4 py-2 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-700">
        <BookMarked size={14} className="text-teal-400" />
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Chapters</span>
      </div>

      {chapters.length === 0 ? (
        <button
          onClick={onAdd}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
        >
          <Plus size={11} />
          Add first chapter
        </button>
      ) : (
        <>
          <button
            onClick={() => onSelect(null)}
            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeChapterId === null ? 'bg-teal-600/30 text-teal-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Check size={12} />
            All scenes
          </button>

          {chapters.map((ch, i) => {
            const active = activeChapterId === ch.id
            return (
              <div
                key={ch.id}
                className={`group shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors ${
                  active ? 'bg-teal-600/30 text-teal-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                onClick={() => { if (editingId !== ch.id) onSelect(ch.id) }}
              >
                <span className={`text-xs font-bold shrink-0 ${active ? 'text-teal-400' : 'text-slate-600'}`}>
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
                    className="text-xs bg-slate-700 text-white rounded px-1.5 py-0.5 outline-none w-32"
                  />
                ) : (
                  <span className="text-xs font-medium whitespace-nowrap max-w-[10rem] truncate">{ch.title}</span>
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

          <button
            onClick={onAdd}
            title="Add chapter"
            className="shrink-0 w-7 h-7 rounded-md bg-teal-500 hover:bg-teal-400 text-white flex items-center justify-center transition-colors"
          >
            <Plus size={13} />
          </button>
        </>
      )}
    </div>
  )
}

/* ── Canvas inner ─────────────────────────────────────────────────── */

function CanvasInner({ adventure, initialNodes, initialChoices, initialChapters, initialCharacters = [], initialItems = [] }: Props) {
  const { screenToFlowPosition } = useReactFlow()
  const [dbNodes, setDbNodes] = useState<Node[]>(initialNodes)
  const [dbChapters, setDbChapters] = useState<Chapter[]>(initialChapters)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(() => {
    if (initialChapters.length === 0) return null
    // If any nodes lack a chapter assignment, default to "all scenes" view so
    // nothing appears missing. This happens when a story was created from a
    // template (nodes have no chapter) and chapters were added later.
    const hasOrphans = initialNodes.some(n => n.chapterId === null)
    return hasOrphans ? null : initialChapters[0].id
  })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentAdventure, setCurrentAdventure] = useState(adventure)
  const [nodeEditorDirty, setNodeEditorDirty] = useState(false)
  const externalSaveRef = useRef<(() => Promise<boolean>) | null>(null)
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)
  const [choiceLabelDraft, setChoiceLabelDraft] = useState('Continue')
  const [creatingChoice, setCreatingChoice] = useState(false)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [chapterNameDraft, setChapterNameDraft] = useState('')
  const [chapterDeleteTarget, setChapterDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [choiceModalId, setChoiceModalId] = useState<string | null>(null)

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!nodeEditorDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [nodeEditorDirty])


  // Autosave dirty node content before navigating away from it.
  // Returns true if clean or save succeeded, false if save failed.
  const saveIfDirty = useCallback(async (): Promise<boolean> => {
    if (!nodeEditorDirty || !externalSaveRef.current) return true
    setSaving(true)
    const ok = await externalSaveRef.current()
    setSaving(false)
    return ok
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
    setDbChoices(prev => prev.filter(c => c.id !== edgeId))
    await fetch(`/api/adventures/${adventure.id}/choices/${edgeId}`, { method: 'DELETE' })
    analytics.choiceDeleted(adventure.id)
  }, [adventure.id])

  const handleChoiceClick = useCallback((choiceId: string) => {
    setChoiceModalId(choiceId)
  }, [])

  const [dbChoices, setDbChoices] = useState<Choice[]>(initialChoices)
  const [dbCharacters, setDbCharacters] = useState<WBCharacter[]>(initialCharacters)
  const [dbItems, setDbItems] = useState<WorldItem[]>(initialItems)
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes.map(toRFNode))

  const isWorldBuilder = adventure.storyType === 'world'
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    initialChoices.map(c => toRFEdge(c, handleLabelChange, handleEdgeDelete, isWorldBuilder ? handleChoiceClick : undefined))
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
    (connection: Connection) => {
      setPendingConnection(connection)
      setChoiceLabelDraft('Continue')
    },
    []
  )

  const handleChoiceConfirm = async () => {
    if (!pendingConnection) return
    setCreatingChoice(true)
    const res = await fetch(`/api/adventures/${adventure.id}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceNodeId: pendingConnection.source,
        targetNodeId: pendingConnection.target,
        label: choiceLabelDraft.trim() || 'Continue',
      }),
    })
    const choice: Choice = await res.json()
    analytics.choiceCreated(adventure.id)
    setDbChoices(prev => [...prev, choice])
    setRfEdges(eds => addEdge(toRFEdge(choice, handleLabelChange, handleEdgeDelete, isWorldBuilder ? handleChoiceClick : undefined), eds))
    setCreatingChoice(false)
    setPendingConnection(null)
  }

  const onEdgesDelete: OnEdgesDelete = useCallback(
    async (deletedEdges) => {
      for (const edge of deletedEdges) {
        await fetch(`/api/adventures/${adventure.id}/choices/${edge.id}`, { method: 'DELETE' })
        setDbChoices(prev => prev.filter(c => c.id !== edge.id))
      }
    },
    [adventure.id]
  )

  const onNodeClick: NodeMouseHandler = useCallback((_evt, rfNode) => {
    if (rfNode.id === selectedNodeId) return
    saveIfDirty().then(ok => {
      if (!ok) return
      setSelectedNodeId(rfNode.id)
    })
  }, [selectedNodeId, saveIfDirty])

  const handlePaneClick = useCallback(() => {
    if (!selectedNodeId) return
    saveIfDirty().then(ok => {
      if (!ok) return
      setSelectedNodeId(null)
    })
  }, [selectedNodeId, saveIfDirty])

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

  const handleAddNode = async (atPosition?: { x: number; y: number }) => {
    const ok = await saveIfDirty()
    if (!ok) return

    const position = atPosition ?? (() => {
      const canvasEl = document.querySelector('.react-flow__renderer') as HTMLElement | null
      const rect = canvasEl?.getBoundingClientRect() ?? { left: 0, top: 0, width: 800, height: 600 }
      return screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    })()

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

  const handleAddChapter = () => {
    setChapterNameDraft(`Chapter ${dbChapters.length + 1}`)
    setShowChapterModal(true)
  }

  const handleChapterConfirm = async () => {
    const title = chapterNameDraft.trim()
    if (!title) return
    setShowChapterModal(false)
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

  const handleDeleteChapter = (chapterId: string) => {
    const chapter = dbChapters.find(c => c.id === chapterId)
    setChapterDeleteTarget({ id: chapterId, title: chapter?.title ?? 'this chapter' })
  }

  const confirmDeleteChapter = async () => {
    if (!chapterDeleteTarget) return
    const { id: chapterId } = chapterDeleteTarget
    setChapterDeleteTarget(null)
    await fetch(`/api/adventures/${adventure.id}/chapters/${chapterId}`, { method: 'DELETE' })
    setDbChapters(prev => prev.filter(c => c.id !== chapterId))
    setDbNodes(prev => prev.map(n => n.chapterId === chapterId ? { ...n, chapterId: null } : n))
    if (activeChapterId === chapterId) {
      const remaining = dbChapters.filter(c => c.id !== chapterId)
      setActiveChapterId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const handleSelectChapter = (id: string | null) => {
    saveIfDirty().then(ok => {
      if (!ok) return
      setSelectedNodeId(null)
      setActiveChapterId(id)
    })
  }

  // ── Node update / delete ──────────────────────────────────────────

  const handleToolbarSave = useCallback(async () => {
    if (externalSaveRef.current) {
      setSaving(true)
      await externalSaveRef.current()
      setSaving(false)
    }
  }, [])

  // Cmd+S / Ctrl+S keyboard shortcut to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleToolbarSave()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleToolbarSave])

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

  return (
    <div className="flex flex-col h-screen">
      {pendingConnection && (
        <InputModal
          title="New Choice"
          description="This text appears as the button players click to take this path."
          inputLabel="Choice text"
          placeholder="e.g. Go into the forest"
          value={choiceLabelDraft}
          onChange={setChoiceLabelDraft}
          confirmLabel="Create choice"
          onConfirm={handleChoiceConfirm}
          onCancel={() => setPendingConnection(null)}
          loading={creatingChoice}
          icon={<GitBranch size={16} />}
        />
      )}
      {showChapterModal && (
        <InputModal
          title="New Chapter"
          description="Chapters help you organise your story into sections."
          inputLabel="Chapter name"
          placeholder={`e.g. Chapter ${dbChapters.length + 1}`}
          value={chapterNameDraft}
          onChange={setChapterNameDraft}
          confirmLabel="Create chapter"
          onConfirm={handleChapterConfirm}
          onCancel={() => setShowChapterModal(false)}
          icon={<BookOpen size={16} />}
        />
      )}
      {chapterDeleteTarget && (
        <ConfirmModal
          title={`Delete "${chapterDeleteTarget.title}"?`}
          description={<>The chapter will be deleted. Its scenes will remain but become <strong>unassigned</strong> from this chapter.</>}
          confirmLabel="Delete chapter"
          onConfirm={confirmDeleteChapter}
          onCancel={() => setChapterDeleteTarget(null)}
        />
      )}
      <Toolbar
        adventureTitle={currentAdventure.title}
        adventureId={currentAdventure.id}
        adventureStatus={currentAdventure.status ?? 'active'}
        adventureIsPublic={currentAdventure.isPublic}
        onSave={handleToolbarSave}
        onSettings={() => setShowSettings(true)}
        saving={saving}
        dirty={nodeEditorDirty}
      />
      {adventure.storyType !== 'world' && (
        <ChaptersNavBar
          chapters={dbChapters}
          activeChapterId={activeChapterId}
          onSelect={handleSelectChapter}
          onAdd={handleAddChapter}
          onRename={handleRenameChapter}
          onDelete={handleDeleteChapter}
        />
      )}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar: WorldBuilder panel (characters, items, and its own chapters) */}
        {adventure.storyType === 'world' && (
          <WorldBuilderPanel
            adventureId={adventure.id}
            characters={dbCharacters}
            items={dbItems}
            onCharactersChange={setDbCharacters}
            onItemsChange={setDbItems}
            chapters={dbChapters}
            activeChapterId={activeChapterId}
            onChapterSelect={handleSelectChapter}
            onChapterAdd={handleAddChapter}
            onChapterRename={handleRenameChapter}
            onChapterDelete={handleDeleteChapter}
          />
        )}

        {/* Canvas */}
        <div
          className="flex-1 relative"
          onDoubleClick={e => {
            if ((e.target as HTMLElement).classList.contains('react-flow__pane')) {
              handleAddNode(screenToFlowPosition({ x: e.clientX, y: e.clientY }))
            }
          }}
        >
          {/* Chapter header badge */}
          {activeChapterId && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-teal-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none">
              <BookMarked size={12} />
              {dbChapters.find(c => c.id === activeChapterId)?.title ?? 'Chapter'}
            </div>
          )}

          {/* Empty canvas guidance */}
          {visibleRfNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="pointer-events-auto flex flex-col items-center gap-4 bg-white/95 border border-gray-200 rounded-2xl px-8 py-7 shadow-sm text-center max-w-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 flex items-center justify-center">
                  <GitBranch size={26} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">Canvas is empty</p>
                  <p className="text-xs text-gray-400 leading-relaxed">Add your first scene to start building your story&apos;s branching structure.</p>
                </div>
                <button
                  onClick={() => handleAddNode()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm shadow transition-colors"
                >
                  <Plus size={14} />
                  Add First Scene
                </button>
                <p className="text-xs text-gray-400 mt-1">or double-click anywhere on the canvas</p>
              </div>
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
            zoomOnDoubleClick={false}
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
              return status === 'completed' ? '#fbbf24' : '#d1d5db'
            }} />
          </ReactFlow>
        </div>

        {selectedDbNode && (
          <NodeEditor
            node={selectedDbNode}
            adventureId={adventure.id}
            chapters={dbChapters}
            nodes={dbNodes}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
            onDirtyChange={setNodeEditorDirty}
            externalSaveRef={externalSaveRef}
            storyType={adventure.storyType}
            worldItems={dbItems}
            characters={dbCharacters}
          />
        )}
      </div>

      {/* Add block bar — docked to the bottom so it's always reachable, no scrolling needed */}
      <AddSceneBar onAddNode={() => handleAddNode()} />

      {choiceModalId && (() => {
        const choice = dbChoices.find(c => c.id === choiceModalId)
        if (!choice) return null
        return (
          <ChoicePathModal
            choice={choice}
            characters={dbCharacters}
            adventureId={adventure.id}
            onClose={() => setChoiceModalId(null)}
            onLabelChange={label => handleLabelChange(choice.id, label)}
            onChoiceUpdate={updated => setDbChoices(prev => prev.map(c => c.id === updated.id ? updated : c))}
          />
        )
      })()}

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
