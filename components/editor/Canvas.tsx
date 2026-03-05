'use client'

import { useCallback, useState } from 'react'
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

import StoryNode, { type StoryNodeData } from './StoryNode'
import EditableEdge from './EditableEdge'
import NodeEditor from './NodeEditor'
import Toolbar from './Toolbar'
import type { Node, Choice, Adventure } from '@/lib/schema'

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
}

function CanvasInner({ adventure, initialNodes, initialChoices }: Props) {
  const { screenToFlowPosition } = useReactFlow()
  const [dbNodes, setDbNodes] = useState<Node[]>(initialNodes)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
  }, [adventure.id])

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes.map(toRFNode))
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    initialChoices.map(c => toRFEdge(c, handleLabelChange, handleEdgeDelete))
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

  const onNodeClick: NodeMouseHandler = useCallback((_evt, node) => {
    setSelectedNodeId(node.id)
  }, [])

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
    // Place new node at the center of the visible canvas area
    const canvasEl = document.querySelector('.react-flow__renderer') as HTMLElement | null
    const rect = canvasEl?.getBoundingClientRect() ?? { left: 0, top: 0, width: 800, height: 600 }
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const position = screenToFlowPosition({ x: centerX, y: centerY })

    const res = await fetch(`/api/adventures/${adventure.id}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Scene',
        content: '',
        nodeType: 'scene',
        positionX: position.x,
        positionY: position.y,
      }),
    })
    const node: Node = await res.json()
    setDbNodes(prev => [...prev, node])
    setRfNodes(prev => [...prev, toRFNode(node)])
    setSelectedNodeId(node.id)
  }

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
      <Toolbar
        adventureTitle={adventure.title}
        adventureId={adventure.id}
        onAddNode={handleAddNode}
        onSave={() => {}}
        saving={saving}
      />
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
            onPaneClick={() => setSelectedNodeId(null)}
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
          <NodeEditor
            node={selectedDbNode}
            adventureId={adventure.id}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
          />
        )}
      </div>
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
