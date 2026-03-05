'use client'

import Link from 'next/link'
import { ArrowLeft, Plus, Save } from 'lucide-react'

interface Props {
  adventureTitle: string
  adventureId: string
  onAddNode: () => void
  onSave: () => void
  saving: boolean
}

export default function Toolbar({ adventureTitle, adventureId, onAddNode, onSave, saving }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
      <Link
        href="/"
        className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
      <span className="text-gray-300">|</span>
      <span className="font-semibold text-gray-800 truncate max-w-xs">{adventureTitle}</span>
      <div className="ml-auto flex gap-2">
        <button
          onClick={onAddNode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} />
          Add Scene
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Saved'}
        </button>
      </div>
    </div>
  )
}
