'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Trash2, Sparkles, RefreshCw, ImageOff, Save } from 'lucide-react'
import type { Node } from '@/lib/schema'
import { analytics } from '@/lib/analytics'

interface Props {
  node: Node | null
  adventureId: string
  onClose: () => void
  onUpdate: (node: Node) => void
  onDelete: (nodeId: string) => void
  onDirtyChange: (dirty: boolean) => void
  externalSaveRef: React.MutableRefObject<(() => Promise<void>) | null>
}

export default function NodeEditor({ node, adventureId, onClose, onUpdate, onDelete, onDirtyChange, externalSaveRef }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [savedTitle, setSavedTitle] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [nodeType, setNodeType] = useState<'start' | 'scene' | 'ending'>('scene')
  const [status, setStatus] = useState<'in_progress' | 'completed'>('in_progress')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [regenCount, setRegenCount] = useState(0)

  const isDirty = title !== savedTitle || content !== savedContent

  // Notify Canvas whenever dirty state changes
  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setContent(node.content)
      setSavedTitle(node.title)
      setSavedContent(node.content)
      setNodeType(node.nodeType as 'start' | 'scene' | 'ending')
      setStatus((node.status ?? 'in_progress') as 'in_progress' | 'completed')
      setImageUrl(node.imageUrl ?? null)
      setRegenCount(0)
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
      if ('title' in updates) setSavedTitle(updates.title as string)
      if ('content' in updates) setSavedContent(updates.content as string)
      onUpdate(updated)
    } finally {
      setSaving(false)
    }
  }, [node, adventureId, onUpdate])

  const handleSave = useCallback(async () => {
    await save({ title, content })
  }, [save, title, content])

  // Expose save to Canvas so Toolbar can trigger it
  useEffect(() => {
    externalSaveRef.current = isDirty ? handleSave : null
  }, [isDirty, handleSave, externalSaveRef])

  // Clean up ref on unmount
  useEffect(() => {
    return () => { externalSaveRef.current = null }
  }, [externalSaveRef])

  const handleGenerateImage = async (isRegen = false) => {
    if (!node) return
    const nextCount = isRegen ? regenCount + 1 : regenCount
    if (isRegen) setRegenCount(nextCount)
    setGeneratingImage(true)
    try {
      const res = await fetch(`/api/adventures/${adventureId}/nodes/${node.id}/image`, {
        method: 'POST',
      })
      const updated: Node = await res.json()
      setImageUrl(updated.imageUrl ?? null)
      onUpdate(updated)
      if (isRegen) analytics.imageRegenerated(adventureId, node.id, nextCount)
      else analytics.imageGenerated(adventureId, node.id)
    } finally {
      setGeneratingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!node) return
    await fetch(`/api/adventures/${adventureId}/nodes/${node.id}/image`, { method: 'DELETE' })
    analytics.imageRemoved(adventureId, node.id)
    setImageUrl(null)
    onUpdate({ ...node, imageUrl: null })
  }

  const handleDelete = async () => {
    if (!node) return
    if (!confirm('Delete this node? All connected choices will also be removed.')) return
    await fetch(`/api/adventures/${adventureId}/nodes/${node.id}`, { method: 'DELETE' })
    onDelete(node.id)
    onClose()
  }

  const handleClose = () => {
    if (isDirty && !confirm('You have unsaved changes. Discard them?')) return
    onDirtyChange(false)
    onClose()
  }

  if (!node) return null

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
          {!isDirty && saving === false && (
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

        {/* Scene Image */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Scene Image</label>
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Scene illustration"
                className="w-full object-cover rounded-lg"
              />
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                <button
                  onClick={() => handleGenerateImage(true)}
                  disabled={generatingImage || regenCount >= 2}
                  title={regenCount >= 2 ? 'Regeneration limit reached (2/2)' : `Regenerate (${regenCount}/2 used)`}
                  className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={12} className={generatingImage ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={handleRemoveImage}
                  title="Remove image"
                  className="p-1.5 bg-black/50 hover:bg-red-600/80 text-white rounded-lg transition-colors"
                >
                  <ImageOff size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleGenerateImage()}
              disabled={generatingImage || !content.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={15} />
              {generatingImage ? 'Generating…' : 'Generate Image with AI'}
            </button>
          )}
          {!content.trim() && !imageUrl && (
            <p className="text-xs text-gray-400 mt-1">Add scene content first to generate an image</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setStatus('in_progress'); save({ status: 'in_progress' }); analytics.sceneStatusChanged(adventureId, node!.id, 'in_progress') }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                status === 'in_progress'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => {
                setStatus('completed')
                save({ status: 'completed' })
                analytics.sceneStatusChanged(adventureId, node!.id, 'completed')
                if (!imageUrl && content.trim()) handleGenerateImage()
              }}
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
              analytics.sceneTypeChanged(adventureId, node!.id, val)
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

      {/* Sticky save footer — visible when dirty */}
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
