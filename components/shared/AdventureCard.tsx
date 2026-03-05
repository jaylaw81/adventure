'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Play, Trash2, GitBranch, Settings } from 'lucide-react'
import type { AdventureWithCounts } from '@/lib/queries'
import ShareToggle from './ShareToggle'
import AdventureSettingsModal from './AdventureSettingsModal'
import { analytics } from '@/lib/analytics'

interface Props {
  adventure: AdventureWithCounts
  onDelete?: (id: string) => void
}

export default function AdventureCard({ adventure, onDelete }: Props) {
  const [current, setCurrent] = useState(adventure)
  const [showSettings, setShowSettings] = useState(false)
  const { outcomes, sceneCount } = current

  const tags: string[] = (() => {
    try { return JSON.parse(current.tags ?? '[]') } catch { return [] }
  })()

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{current.title}</h2>
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
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
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
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

        <div className="pt-2 border-t border-gray-100">
          <ShareToggle
            adventureId={current.id}
            initialIsPublic={current.isPublic}
            initialShareToken={current.shareToken ?? null}
          />
        </div>

        <div className="flex gap-2">
          <Link
            href={`/play/${current.id}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <Play size={14} />
            Play
          </Link>
          <Link
            href={`/edit/${current.id}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Pencil size={14} />
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => { analytics.adventureDeleted(current.id); onDelete(current.id) }}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <AdventureSettingsModal
          adventure={current}
          onClose={() => setShowSettings(false)}
          onSave={updated => setCurrent(prev => ({ ...prev, ...updated }))}
        />
      )}
    </>
  )
}
