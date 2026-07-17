'use client'

import { useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import type { WBCharacter } from '@/lib/worldBuilder'
import CharacterModal from './CharacterModal'

interface Props {
  adventureId: string
  characters: WBCharacter[]
  onChange: (chars: WBCharacter[]) => void
}

export default function CharactersPanel({ adventureId, characters, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)

  const editingChar =
    editingId === 'new'
      ? null
      : (characters.find(c => c.id === editingId) ?? null)

  const showModal = editingId !== null && (editingId === 'new' || editingChar !== null)

  const handleSave = (updated: WBCharacter) => {
    if (editingId === 'new') {
      onChange([...characters, updated])
    } else {
      onChange(characters.map(c => c.id === updated.id ? updated : c))
    }
  }

  const handleDelete = (charId: string) => {
    onChange(characters.filter(c => c.id !== charId))
  }

  return (
    <>
      <div className="w-52 shrink-0 h-full bg-slate-900 border-r border-slate-700 flex flex-col">
        {/* Panel header */}
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">⚔</span>
            <span className="text-xs font-bold text-slate-200">Characters</span>
          </div>
          <button
            onClick={() => setEditingId('new')}
            title="Add character"
            className="w-6 h-6 rounded-md bg-amber-500 hover:bg-amber-400 text-white flex items-center justify-center transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Character list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1">
          {characters.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-center py-6 px-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-lg">⚔</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1">No characters yet</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Add characters whose stats will change as readers make choices.
                </p>
              </div>
              <button
                onClick={() => setEditingId('new')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
              >
                <Plus size={11} />
                Add first character
              </button>
            </div>
          ) : (
            characters.map(char => {
              const attrCount = (char.attributes ?? []).length
              return (
                <button
                  key={char.id}
                  onClick={() => setEditingId(char.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-amber-400">
                      {char.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{char.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {attrCount === 0
                        ? 'No attributes'
                        : `${attrCount} attribute${attrCount !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <ChevronRight
                    size={12}
                    className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors"
                  />
                </button>
              )
            })
          )}
        </div>
      </div>

      {showModal && (
        <CharacterModal
          char={editingChar}
          adventureId={adventureId}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  )
}
