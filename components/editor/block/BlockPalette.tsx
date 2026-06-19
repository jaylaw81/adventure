'use client'

import { Plus, BookOpen, Flag } from 'lucide-react'

interface Props {
  onAddScene: () => void
  onAddEnding: () => void
  sceneCount: number
  endingCount: number
  loading: boolean
}

export default function BlockPalette({ onAddScene, onAddEnding, sceneCount, endingCount, loading }: Props) {
  return (
    <div className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Add Block</p>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
        {/* Scene block */}
        <button
          onClick={onAddScene}
          disabled={loading}
          className="group text-left rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-400 transition-all disabled:opacity-50 shadow-sm"
        >
          <div className="px-3 py-2 bg-indigo-500 flex items-center gap-1.5">
            <BookOpen size={11} className="text-white" />
            <span className="text-xs font-bold text-white">Scene</span>
          </div>
          <div className="px-3 py-2 bg-indigo-50 border-x border-indigo-100">
            <div className="h-1.5 bg-indigo-200 rounded mb-1.5 w-3/4" />
            <div className="h-1 bg-indigo-100 rounded mb-1 w-full" />
            <div className="h-1 bg-indigo-100 rounded w-2/3" />
          </div>
          <div className="px-3 py-1.5 flex items-center gap-1 text-indigo-600 text-xs font-medium bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
            <Plus size={11} />
            Add Scene
          </div>
        </button>

        {/* Ending block */}
        <button
          onClick={onAddEnding}
          disabled={loading}
          className="group text-left rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-400 transition-all disabled:opacity-50 shadow-sm"
        >
          <div className="px-3 py-2 bg-purple-500 flex items-center gap-1.5">
            <Flag size={11} className="text-white" />
            <span className="text-xs font-bold text-white">The End</span>
          </div>
          <div className="px-3 py-2 bg-purple-50 border-x border-purple-100">
            <div className="h-1.5 bg-purple-200 rounded mb-1.5 w-3/4" />
            <div className="h-1 bg-purple-100 rounded mb-1 w-full" />
            <div className="h-1 bg-purple-100 rounded w-2/3" />
          </div>
          <div className="px-3 py-1.5 flex items-center gap-1 text-purple-600 text-xs font-medium bg-purple-50 border border-purple-100 group-hover:bg-purple-100 transition-colors">
            <Plus size={11} />
            Add Ending
          </div>
        </button>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400 leading-relaxed">
            Click a block type to add it to your story. Drag the handle to reorder.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-gray-100 flex flex-col gap-0.5">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-indigo-600">{sceneCount}</span>{' '}
          {sceneCount === 1 ? 'scene' : 'scenes'}
        </p>
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-purple-600">{endingCount}</span>{' '}
          {endingCount === 1 ? 'ending' : 'endings'}
        </p>
      </div>
    </div>
  )
}
