'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { X, Trash2, Sparkles, RefreshCw, ImageOff, Save, Check, Wand2, ChevronDown, ChevronUp, CheckCheck, Lightbulb, AlertCircle, Loader2 } from 'lucide-react'
import type { Node, Chapter } from '@/lib/schema'
import { analytics } from '@/lib/analytics'
import type { AnalyzeResult } from '@/app/api/adventures/[id]/nodes/[nodeId]/analyze/route'
import SoundPicker from './SoundPicker'

interface Props {
  node: Node | null
  adventureId: string
  chapters: Chapter[]
  nodes: Node[]
  onClose: () => void
  onUpdate: (node: Node) => void
  onDelete: (nodeId: string) => void
  onDirtyChange: (dirty: boolean) => void
  externalSaveRef: React.MutableRefObject<(() => Promise<boolean>) | null>
}

export default function NodeEditor({ node, adventureId, chapters, nodes, onClose, onUpdate, onDelete, onDirtyChange, externalSaveRef }: Props) {
  const { data: session } = useSession()
  const isOrgTier = session?.user?.tier === 'organization'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [savedTitle, setSavedTitle] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [nodeType, setNodeType] = useState<'start' | 'scene' | 'ending' | 'chapter_end'>('scene')
  const [status, setStatus] = useState<'in_progress' | 'completed'>('in_progress')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [chapterId, setChapterId] = useState<string | null>(null)
  const [nextChapterId, setNextChapterId] = useState<string | null>(null)
  const [chapterEntryNodeId, setChapterEntryNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [regenCount, setRegenCount] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [soundUrl, setSoundUrl] = useState<string | null>(null)
  const [soundTitle, setSoundTitle] = useState<string | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const isDirty = title !== savedTitle || content !== savedContent

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setContent(node.content)
      setSavedTitle(node.title)
      setSavedContent(node.content)
      setNodeType(node.nodeType as 'start' | 'scene' | 'ending' | 'chapter_end')
      setStatus((node.status ?? 'in_progress') as 'in_progress' | 'completed')
      setImageUrl(node.imageUrl ?? null)
      setChapterId(node.chapterId ?? null)
      setNextChapterId(node.nextChapterId ?? null)
      setChapterEntryNodeId(node.chapterEntryNodeId ?? null)
      setSoundUrl(node.soundUrl ?? null)
      setSoundTitle(node.soundTitle ?? null)
      setRegenCount(0)
      setSaveError(null)
      setShowDeleteConfirm(false)
      setAnalysis(null)
      setAnalyzeError(null)
    }
  }, [node?.id])

  const save = useCallback(async (updates: Partial<Node>): Promise<boolean> => {
    if (!node) return false
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/adventures/${adventureId}/nodes/${node.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const updated = await res.json()
      if ('title' in updates) setSavedTitle(updates.title as string)
      if ('content' in updates) setSavedContent(updates.content as string)
      onUpdate(updated)
      return true
    } catch {
      setSaveError('Save failed — check your connection and try again')
      return false
    } finally {
      setSaving(false)
    }
  }, [node, adventureId, onUpdate])

  const handleSave = useCallback(async (): Promise<boolean> => {
    return save({ title, content })
  }, [save, title, content])

  const handleDiscard = useCallback(() => {
    setTitle(savedTitle)
    setContent(savedContent)
    setSaveError(null)
  }, [savedTitle, savedContent])

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
      if (!res.ok) throw new Error(`${res.status}`)
      const updated: Node = await res.json()
      setImageUrl(updated.imageUrl ?? null)
      onUpdate(updated)
      if (isRegen) analytics.imageRegenerated(adventureId, node.id, nextCount)
      else analytics.imageGenerated(adventureId, node.id)
    } catch {
      // Generation failed silently — button re-enables via finally
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

  const handleDeleteConfirm = async () => {
    if (!node) return
    await fetch(`/api/adventures/${adventureId}/nodes/${node.id}`, { method: 'DELETE' })
    onDelete(node.id)
    onClose()
  }

  const handleAnalyze = async () => {
    if (!node || !content.trim()) return
    setAnalyzing(true)
    setAnalyzeError(null)
    setAssistantOpen(true)
    try {
      const res = await fetch(`/api/adventures/${adventureId}/nodes/${node.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, nodeType }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setAnalyzeError(data.error ?? 'Analysis failed — try again.')
      } else {
        setAnalysis(await res.json())
      }
    } catch {
      setAnalyzeError('Network error — check your connection.')
    } finally {
      setAnalyzing(false)
    }
  }

  const applyFix = (original: string, fixed: string) => {
    setContent(prev => prev.replace(original, fixed))
  }

  const handleClose = useCallback(async () => {
    if (isDirty) await handleSave()
    onDirtyChange(false)
    onClose()
  }, [isDirty, handleSave, onDirtyChange, onClose])

  if (!node) return null

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 min-h-[52px]">
        {showDeleteConfirm ? (
          <>
            <span className="text-xs font-semibold text-red-600">Delete this scene?</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDeleteConfirm}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Check size={11} />
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors"
              >
                <X size={11} />
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
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
              {!isDirty && !saving && !saveError && (
                <span className="text-xs text-gray-400">Saved</span>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete scene"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </>
        )}
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
                  className="p-1.5 bg-[#0d0c1a]/70 hover:bg-[#0d0c1a]/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={12} className={generatingImage ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={handleRemoveImage}
                  title="Remove image"
                  className="p-1.5 bg-[#0d0c1a]/70 hover:bg-red-600/80 text-white rounded-lg transition-colors"
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

        <SoundPicker
          currentSoundUrl={soundUrl}
          currentSoundTitle={soundTitle}
          onSelect={(url, title) => {
            setSoundUrl(url)
            setSoundTitle(title)
            save({ soundUrl: url, soundTitle: title })
          }}
          onRemove={() => {
            setSoundUrl(null)
            setSoundTitle(null)
            save({ soundUrl: null, soundTitle: null })
          }}
        />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setStatus('in_progress'); save({ status: 'in_progress' }); analytics.sceneStatusChanged(adventureId, node!.id, 'in_progress') }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                status === 'in_progress'
                  ? 'border-gray-400 bg-gray-100 text-gray-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Draft
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
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Done
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Scene Type</label>
          <select
            value={nodeType}
            onChange={e => {
              const val = e.target.value as 'start' | 'scene' | 'ending' | 'chapter_end'
              setNodeType(val)
              save({ nodeType: val })
              analytics.sceneTypeChanged(adventureId, node!.id, val)
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="start">Start</option>
            <option value="scene">Scene</option>
            <option value="ending">Ending</option>
            <option value="chapter_end">Chapter End → Next Chapter</option>
          </select>
        </div>

        {/* Chapter assignment */}
        {chapters.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chapter</label>
            <select
              value={chapterId ?? ''}
              onChange={e => {
                const val = e.target.value || null
                setChapterId(val)
                save({ chapterId: val })
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">— Unassigned —</option>
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Next chapter selector — only for chapter_end nodes */}
        {nodeType === 'chapter_end' && chapters.length > 0 && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-teal-700 mb-1.5">Continues to chapter:</label>
              <select
                value={nextChapterId ?? ''}
                onChange={e => {
                  const val = e.target.value || null
                  setNextChapterId(val)
                  // Clear the entry scene when chapter changes
                  if (val !== nextChapterId) {
                    setChapterEntryNodeId(null)
                    save({ nextChapterId: val, chapterEntryNodeId: null })
                  } else {
                    save({ nextChapterId: val })
                  }
                }}
                className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              >
                <option value="">— Select next chapter —</option>
                {chapters
                  .filter(ch => ch.id !== chapterId)
                  .map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.title}</option>
                  ))}
              </select>
            </div>

            {/* Entry scene picker — shown when a next chapter is selected */}
            {nextChapterId && (() => {
              const chapterNodes = nodes.filter(n => n.chapterId === nextChapterId)
              if (chapterNodes.length === 0) return null
              return (
                <div>
                  <label className="block text-xs font-semibold text-teal-700 mb-1.5">Entry scene:</label>
                  <select
                    value={chapterEntryNodeId ?? ''}
                    onChange={e => {
                      const val = e.target.value || null
                      setChapterEntryNodeId(val)
                      save({ chapterEntryNodeId: val })
                    }}
                    className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  >
                    <option value="">— Auto / use canvas connections —</option>
                    {chapterNodes.map(n => (
                      <option key={n.id} value={n.id}>{n.title || '(untitled scene)'}</option>
                    ))}
                  </select>
                  <p className="text-xs text-teal-600 mt-1.5">
                    {chapterEntryNodeId
                      ? `Readers jump directly to "${chapterNodes.find(n => n.id === chapterEntryNodeId)?.title || 'this scene'}".`
                      : 'Readers follow canvas connections or the chapter\'s start scene.'}
                  </p>
                </div>
              )
            })()}

            {!nextChapterId && (
              <p className="text-xs text-teal-600">Select a chapter above to configure where readers continue.</p>
            )}
          </div>
        )}

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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-600">Content</label>
            {content.trim() && (
              <span className="text-xs text-gray-400">
                {content.trim().split(/\s+/).length} words
              </span>
            )}
          </div>
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setAnalysis(null) }}
            placeholder="Write the scene content…"
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        {/* Writing Assistant */}
        <div className={`border rounded-xl overflow-hidden ${isOrgTier ? 'border-violet-200' : 'border-gray-200'}`}>
          {isOrgTier ? (
            <button
              onClick={() => assistantOpen ? setAssistantOpen(false) : handleAnalyze()}
              disabled={analyzing || !content.trim()}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-violet-50 hover:bg-violet-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-violet-700">
                {analyzing
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Wand2 size={13} />}
                {analyzing ? 'Analyzing…' : 'Writing Assistant'}
              </span>
              {!analyzing && (
                analysis
                  ? (assistantOpen ? <ChevronUp size={13} className="text-violet-400" /> : <ChevronDown size={13} className="text-violet-400" />)
                  : <span className="text-xs text-violet-500">Check writing</span>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 cursor-not-allowed">
              <span className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Wand2 size={13} />
                Writing Assistant
              </span>
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Organization tier</span>
            </div>
          )}

          {assistantOpen && (
            <div className="px-3 pb-3 pt-2 bg-white flex flex-col gap-3">
              {analyzeError && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {analyzeError}
                </p>
              )}

              {analysis && (
                <>
                  {/* Quality badge + word count */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      analysis.quality === 'great'
                        ? 'bg-green-100 text-green-700'
                        : analysis.quality === 'good'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {analysis.quality === 'great' ? <CheckCheck size={11} /> : analysis.quality === 'good' ? <Check size={11} /> : <AlertCircle size={11} />}
                      {analysis.quality === 'great' ? 'Great writing' : analysis.quality === 'good' ? 'Looking good' : 'Needs work'}
                    </span>
                    <span className="text-xs text-gray-400">{analysis.wordCount} words</span>
                  </div>

                  {/* Grammar issues */}
                  {analysis.issues.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                        <AlertCircle size={11} className="text-red-400" /> Grammar &amp; spelling
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {analysis.issues.map((issue, i) => (
                          <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-2">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="min-w-0">
                                <p className="text-xs text-red-700 line-through truncate">{issue.original}</p>
                                <p className="text-xs text-green-700 font-medium truncate">{issue.fixed}</p>
                              </div>
                              <button
                                onClick={() => applyFix(issue.original, issue.fixed)}
                                className="shrink-0 px-2 py-0.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-md transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">{issue.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.issues.length === 0 && (
                    <p className="text-xs text-green-600 flex items-center gap-1.5">
                      <CheckCheck size={12} /> No grammar issues found
                    </p>
                  )}

                  {/* Hints */}
                  {analysis.hints.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                        <Lightbulb size={11} className="text-amber-400" /> Writing tips
                      </p>
                      <ul className="flex flex-col gap-1">
                        {analysis.hints.map((hint, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="text-xs text-violet-500 hover:text-violet-700 transition-colors self-start"
                  >
                    Re-analyze
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Sticky footer */}
      {saveError ? (
        <div className="px-4 py-3 border-t border-red-200 bg-red-50 flex items-center justify-between gap-3">
          <span className="text-xs text-red-700 font-medium">{saveError}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={12} />
            {saving ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      ) : isDirty ? (
        <div className="px-4 py-3 border-t border-amber-100 bg-amber-50 flex items-center justify-between gap-3">
          <span className="text-xs text-amber-700 font-medium">Unsaved changes</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="text-xs text-amber-600 hover:text-amber-900 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
