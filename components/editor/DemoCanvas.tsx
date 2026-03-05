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
import Link from 'next/link'
import { ArrowLeft, Plus, RotateCcw, Sparkles, X, Save, Trash2, Play } from 'lucide-react'

import StoryNode, { type StoryNodeData } from './StoryNode'
import EditableEdge from './EditableEdge'
import type { Node, Choice } from '@/lib/schema'
import {
  demoLoad,
  demoReset,
  demoUpdateNode,
  demoCreateNode,
  demoDeleteNode,
  demoCreateChoice,
  demoUpdateChoice,
  demoDeleteChoice,
} from '@/lib/demo-store'
import { DEMO_ADVENTURE } from '@/lib/demo-story'

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
      adventureId: DEMO_ADVENTURE.id,
      onLabelChange,
      onDelete,
    },
  }
}

// ─── Demo Node Editor ────────────────────────────────────────────────────────

interface EditorProps {
  node: Node
  onClose: () => void
  onUpdate: (node: Node) => void
  onDelete: (nodeId: string) => void
  onDirtyChange: (dirty: boolean) => void
  externalSaveRef: React.MutableRefObject<(() => Promise<void>) | null>
}

function DemoNodeEditor({ node, onClose, onUpdate, onDelete, onDirtyChange, externalSaveRef }: EditorProps) {
  const [title, setTitle] = useState(node.title)
  const [content, setContent] = useState(node.content)
  const [savedTitle, setSavedTitle] = useState(node.title)
  const [savedContent, setSavedContent] = useState(node.content)
  const [nodeType, setNodeType] = useState(node.nodeType as 'start' | 'scene' | 'ending')
  const [status, setStatus] = useState((node.status ?? 'in_progress') as 'in_progress' | 'completed')
  const [saving, setSaving] = useState(false)

  const isDirty = title !== savedTitle || content !== savedContent

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])

  // Reset when switching nodes
  useEffect(() => {
    setTitle(node.title)
    setContent(node.content)
    setSavedTitle(node.title)
    setSavedContent(node.content)
    setNodeType(node.nodeType as 'start' | 'scene' | 'ending')
    setStatus((node.status ?? 'in_progress') as 'in_progress' | 'completed')
  }, [node.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(async () => {
    setSaving(true)
    const updated = demoUpdateNode(node.id, { title, content })
    setSavedTitle(title)
    setSavedContent(content)
    onUpdate(updated)
    setSaving(false)
  }, [node.id, title, content, onUpdate])

  useEffect(() => {
    externalSaveRef.current = isDirty ? handleSave : null
  }, [isDirty, handleSave, externalSaveRef])

  useEffect(() => { return () => { externalSaveRef.current = null } }, [externalSaveRef])

  const handleTypeChange = (val: 'start' | 'scene' | 'ending') => {
    setNodeType(val)
    const updated = demoUpdateNode(node.id, { nodeType: val })
    onUpdate(updated)
  }

  const handleStatusChange = (val: 'in_progress' | 'completed') => {
    setStatus(val)
    const updated = demoUpdateNode(node.id, { status: val })
    onUpdate(updated)
  }

  const handleDelete = () => {
    if (!confirm('Delete this scene? All connected choices will also be removed.')) return
    demoDeleteNode(node.id)
    onDelete(node.id)
    onClose()
  }

  const handleClose = () => {
    if (isDirty && !confirm('You have unsaved changes. Discard them?')) return
    onDirtyChange(false)
    onClose()
  }

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Edit Scene</h3>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
          {!isDirty && !saving && (
            <span className="text-xs text-gray-400">Saved</span>
          )}
          <button onClick={handleDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
          <button onClick={handleClose} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* AI image — locked for demo */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Scene Image</label>
          <div className="w-full flex flex-col items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <Sparkles size={18} className="text-gray-300" />
            <p className="text-xs text-gray-400 text-center px-3">
              AI image generation is available after sign-up — it's free!
            </p>
            <Link
              href="/sign-up"
              className="text-xs font-medium text-amber-600 hover:underline"
            >
              Create a free account →
            </Link>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('in_progress')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                status === 'in_progress'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                status === 'completed'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Scene Type</label>
          <select
            value={nodeType}
            onChange={e => handleTypeChange(e.target.value as 'start' | 'scene' | 'ending')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="start">Start</option>
            <option value="scene">Scene</option>
            <option value="ending">Ending</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Scene title…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write the scene content…"
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>
      </div>

      {isDirty && (
        <div className="px-4 py-3 border-t border-amber-100 bg-amber-50 flex items-center justify-between gap-3">
          <span className="text-xs text-amber-700 font-medium">Unsaved changes</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={12} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Demo Canvas Inner ───────────────────────────────────────────────────────

function DemoCanvasInner() {
  const { screenToFlowPosition } = useReactFlow()
  const { nodes: initNodes, choices: initChoices } = demoLoad()

  const [dbNodes, setDbNodes] = useState<Node[]>(initNodes)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [nodeEditorDirty, setNodeEditorDirty] = useState(false)
  const externalSaveRef = useRef<(() => Promise<void>) | null>(null)

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

  const handleLabelChange = useCallback((edgeId: string, label: string) => {
    setRfEdges(prev =>
      prev.map(e => e.id === edgeId ? { ...e, data: { ...e.data, label } } : e)
    )
    demoUpdateChoice(edgeId, label)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdgeDelete = useCallback((edgeId: string) => {
    setRfEdges(prev => prev.filter(e => e.id !== edgeId))
    demoDeleteChoice(edgeId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initNodes.map(toRFNode))
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    initChoices.map(c => toRFEdge(c, handleLabelChange, handleEdgeDelete))
  )

  const selectedDbNode = dbNodes.find(n => n.id === selectedNodeId) ?? null

  const onConnect = useCallback(
    (connection: Connection) => {
      const label = prompt('Choice text:', 'Continue') ?? 'Continue'
      const choice = demoCreateChoice({
        sourceNodeId: connection.source!,
        targetNodeId: connection.target!,
        label,
      })
      setRfEdges(eds => addEdge(toRFEdge(choice, handleLabelChange, handleEdgeDelete), eds))
    },
    [handleLabelChange, handleEdgeDelete]
  )

  const onEdgesDelete: OnEdgesDelete = useCallback((deletedEdges) => {
    for (const edge of deletedEdges) demoDeleteChoice(edge.id)
  }, [])

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

  const onNodeDragStop: NodeMouseHandler = useCallback((_evt, rfNode) => {
    demoUpdateNode(rfNode.id, { positionX: rfNode.position.x, positionY: rfNode.position.y })
  }, [])

  const handleAddNode = () => {
    if (!confirmDiscard()) return
    setNodeEditorDirty(false)
    const canvasEl = document.querySelector('.react-flow__renderer') as HTMLElement | null
    const rect = canvasEl?.getBoundingClientRect() ?? { left: 0, top: 0, width: 800, height: 600 }
    const position = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    const node = demoCreateNode({
      title: 'New Scene',
      content: '',
      nodeType: 'scene',
      status: 'in_progress',
      imageUrl: null,
      positionX: position.x,
      positionY: position.y,
    })
    setDbNodes(prev => [...prev, node])
    setRfNodes(prev => [...prev, toRFNode(node)])
    setSelectedNodeId(node.id)
  }

  const handleNodeUpdate = (updated: Node) => {
    setDbNodes(prev => prev.map(n => n.id === updated.id ? updated : n))
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

  const handleReset = () => {
    if (!confirm('Reset the demo to its original state? All your changes will be lost.')) return
    demoReset()
    window.location.reload()
  }

  const handleToolbarSave = useCallback(async () => {
    if (externalSaveRef.current) await externalSaveRef.current()
  }, [])

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Demo banner */}
      <div className="relative z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-white/20 rounded px-1.5 py-0.5 text-xs font-bold tracking-wide">DEMO</span>
          <span>This is a live preview — edit freely! Changes are saved in your browser only.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw size={12} />
            Reset demo
          </button>
          <Link
            href="/sign-up"
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold transition-colors"
          >
            Create free account →
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="z-10 flex items-center gap-3 px-4 h-14 border-b border-gray-200 bg-white shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm">
          <ArrowLeft size={15} />
          Back
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="font-semibold text-gray-900 text-sm truncate flex-1">{DEMO_ADVENTURE.title}</h1>
        <button
          onClick={handleAddNode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          Add Scene
        </button>
        <Link
          href="/demo/play"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Play size={15} />
          Play
        </Link>
        {nodeEditorDirty && (
          <button
            onClick={handleToolbarSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={15} />
            Save
          </button>
        )}
      </div>

      {/* Canvas + Node editor */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
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
              const status = (n.data as StoryNodeData).status ?? 'in_progress'
              return status === 'completed' ? '#fca5a5' : '#93c5fd'
            }} />
          </ReactFlow>
        </div>

        {selectedDbNode && (
          <DemoNodeEditor
            node={selectedDbNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
            onDirtyChange={setNodeEditorDirty}
            externalSaveRef={externalSaveRef}
          />
        )}
      </div>
    </div>
  )
}

export default function DemoCanvas() {
  return (
    <ReactFlowProvider>
      <DemoCanvasInner />
    </ReactFlowProvider>
  )
}
