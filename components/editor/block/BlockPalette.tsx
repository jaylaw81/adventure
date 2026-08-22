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
    <div className="w-full shrink-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] flex items-center gap-3 px-4 py-2 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-gray-200">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Add Block</p>
      </div>

      <button
        onClick={onAddScene}
        disabled={loading}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
      >
        <BookOpen size={14} />
        Add Scene
      </button>

      <button
        onClick={onAddEnding}
        disabled={loading}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
      >
        <Flag size={14} />
        Add Ending
      </button>

      <p className="hidden md:block text-xs text-gray-400 shrink-0">
        Drag the handle to reorder blocks.
      </p>

      <div className="ml-auto flex items-center gap-3 shrink-0 pl-3 border-l border-gray-200">
        <p className="text-xs text-gray-500 whitespace-nowrap">
          <span className="font-semibold text-indigo-600">{sceneCount}</span>{' '}
          {sceneCount === 1 ? 'scene' : 'scenes'}
        </p>
        <p className="text-xs text-gray-500 whitespace-nowrap">
          <span className="font-semibold text-purple-600">{endingCount}</span>{' '}
          {endingCount === 1 ? 'ending' : 'endings'}
        </p>
      </div>
    </div>
  )
}
