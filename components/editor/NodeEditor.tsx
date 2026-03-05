'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Node } from '@/lib/schema'

interface Props {
  node: Node | null
  adventureId: string
  onClose: () => void
  onUpdate: (node: Node) => void
  onDelete: (nodeId: string) => void
}

export default function NodeEditor({ node, adventureId, onClose, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [nodeType, setNodeType] = useState<'start' | 'scene' | 'ending'>('scene')
  const [status, setStatus] = useState<'in_progress' | 'completed'>('in_progress')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setContent(node.content)
      setNodeType(node.nodeType as 'start' | 'scene' | 'ending')
      setStatus((node.status ?? 'in_progress') as 'in_progress' | 'completed')
    }
  }, [node?.id])

  const save = useCallback(async (updates: Partial<Node>) => {
    if (!node) return
    setSaving(true)
    try {
      const res = await fetch(`/api/adventures/${adventureId}/nodes/${node.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const updated = await res.json()
      onUpdate(updated)
    } finally {
      setSaving(false)
    }
  }, [node, adventureId, onUpdate])

  const handleDelete = async () => {
    if (!node) return
    if (!confirm('Delete this node? All connected choices will also be removed.')) return
    await fetch(`/api/adventures/${adventureId}/nodes/${node.id}`, { method: 'DELETE' })
    onDelete(node.id)
    onClose()
  }

  if (!node) return null

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Edit Scene</h3>
        <div className="flex gap-2">
          {saving && <span className="text-xs text-gray-400 self-center">Saving…</span>}
          <button onClick={handleDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setStatus('in_progress'); save({ status: 'in_progress' }) }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                status === 'in_progress'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => { setStatus('completed'); save({ status: 'completed' }) }}
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
            onChange={e => {
              const val = e.target.value as 'start' | 'scene' | 'ending'
              setNodeType(val)
              save({ nodeType: val })
            }}
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
            onBlur={() => save({ title })}
            placeholder="Scene title…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onBlur={() => save({ content })}
            placeholder="Write the scene content…"
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>
      </div>
    </div>
  )
}
