'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Pencil, Play, Trash2, GitBranch, Settings, AlertTriangle } from 'lucide-react'
import type { AdventureWithCounts } from '@/lib/queries'
import ShareToggle from './ShareToggle'
import AdventureSettingsModal from './AdventureSettingsModal'
import { analytics } from '@/lib/analytics'

interface Props {
  adventure: AdventureWithCounts
  onDelete?: (id: string) => void
  canMakePublic?: boolean
  canMakePrivate?: boolean
}

function DeleteConfirmModal({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30,10,60,0.65)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div>
            <h2 id="delete-dialog-title" className="text-lg font-bold text-gray-900">Delete story?</h2>
            <p id="delete-dialog-desc" className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">&ldquo;{title}&rdquo;</span> will be permanently deleted along with all its scenes and choices. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdventureCard({ adventure, onDelete, canMakePublic = true, canMakePrivate = true }: Props) {
  const [current, setCurrent] = useState(adventure)
  const [showSettings, setShowSettings] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { outcomes, sceneCount } = current

  const tags: string[] = (() => {
    try { return JSON.parse(current.tags ?? '[]') } catch { return [] }
  })()

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-violet-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
        {/* Color accent strip at top */}
        <div className="h-1.5 w-full"
          style={{ background: sceneCount === 0
            ? '#e5e7eb'
            : outcomes > 0
              ? 'linear-gradient(90deg, #7c3aed, #a78bfa)'
              : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          }}
        />

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold mb-1" style={{ color: '#1e0a3c' }}>{current.title}</h2>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-violet-500 transition-colors shrink-0 mt-0.5"
                title="Story settings"
              >
                <Settings size={16} />
              </button>
            </div>
            {current.description && (
              <p className="text-gray-500 text-sm line-clamp-2">{current.description}</p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              {sceneCount > 0 ? (
                <>
                  <span className="text-xs text-gray-500">{sceneCount} scene{sceneCount !== 1 ? 's' : ''}</span>
                  <span className="text-gray-200">·</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600">
                    <GitBranch size={12} />
                    {outcomes === 0
                      ? 'No endings reachable'
                      : `${outcomes} ending${outcomes !== 1 ? 's' : ''} reachable`}
                  </span>
                </>
              ) : (
                <span className="text-gray-400 text-xs italic">No scenes yet</span>
              )}
            </div>

            <p className="text-gray-400 text-xs mt-2">
              Created {new Date(current.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="pt-2 border-t border-violet-50">
            <ShareToggle
              adventureId={current.id}
              initialIsPublic={current.isPublic}
              initialShareToken={current.shareToken ?? null}
              canMakePublic={canMakePublic}
              canMakePrivate={canMakePrivate}
            />
          </div>

          <div className="flex gap-2">
            <Link
              href={`/play/${current.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              <Play size={13} />
              Play
            </Link>
            <Link
              href={`/edit/${current.id}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 text-violet-700 rounded-xl text-sm font-medium hover:bg-violet-100 transition-colors"
            >
              <Pencil size={13} />
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="ml-auto flex items-center gap-1 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                aria-label="Delete story"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showSettings && (
        <AdventureSettingsModal
          adventure={current}
          onClose={() => setShowSettings(false)}
          onSave={updated => setCurrent(prev => ({ ...prev, ...updated }))}
        />
      )}

      {showDeleteConfirm && onDelete && (
        <DeleteConfirmModal
          title={current.title}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            analytics.adventureDeleted(current.id)
            onDelete(current.id)
            setShowDeleteConfirm(false)
          }}
        />
      )}
    </>
  )
}
