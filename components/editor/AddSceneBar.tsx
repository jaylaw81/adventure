'use client'

import { Plus } from 'lucide-react'

interface Props {
  onAddNode: () => void
}

export default function AddSceneBar({ onAddNode }: Props) {
  return (
    <div className="w-full shrink-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] flex items-center gap-3 px-4 py-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pr-3 border-r border-gray-200">
        Add Block
      </p>
      <button
        onClick={onAddNode}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
      >
        <Plus size={16} />
        Add Scene
      </button>
    </div>
  )
}
