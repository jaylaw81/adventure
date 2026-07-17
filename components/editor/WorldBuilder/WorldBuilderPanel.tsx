'use client'

import { useState } from 'react'
import { Plus, ChevronRight, Pencil, Trash2, Check, BookMarked, Swords, Package, Skull } from 'lucide-react'
import type { WBCharacter, WorldItem, ItemType } from '@/lib/worldBuilder'
import { ITEM_TYPE_LABELS, ITEM_TYPE_ICONS } from '@/lib/worldBuilder'
import type { Chapter } from '@/lib/schema'
import CharacterModal from './CharacterModal'
import ItemModal from './ItemModal'

const ITEM_ICON: Record<ItemType, string> = ITEM_TYPE_ICONS

interface Props {
  adventureId: string
  characters: WBCharacter[]
  items: WorldItem[]
  onCharactersChange: (chars: WBCharacter[]) => void
  onItemsChange: (items: WorldItem[]) => void
  chapters?: Chapter[]
  activeChapterId?: string | null
  onChapterSelect?: (id: string | null) => void
  onChapterAdd?: () => void
  onChapterRename?: (id: string, title: string) => void
  onChapterDelete?: (id: string) => void
}

type Tab = 'characters' | 'items' | 'chapters'

// ─── Icon Rail Button ────────────────────────────────────────────────────────

function RailButton({
  label,
  icon: Icon,
  active,
  activeClass,
  accentClass,
  onClick,
}: {
  label: string
  icon: React.ElementType
  active: boolean
  activeClass: string
  accentClass: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative w-8 h-10 rounded-lg flex items-center justify-center transition-colors ${
        active ? activeClass : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
      }`}
    >
      {active && (
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full ${accentClass}`} />
      )}
      <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
    </button>
  )
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export default function WorldBuilderPanel({
  adventureId,
  characters,
  items,
  onCharactersChange,
  onItemsChange,
  chapters,
  activeChapterId,
  onChapterSelect,
  onChapterAdd,
  onChapterRename,
  onChapterDelete,
}: Props) {
  const hasChapters = chapters !== undefined
  const [tab, setTab] = useState<Tab>('characters')

  const [editingCharId, setEditingCharId] = useState<string | 'new' | null>(null)
  const editingChar = editingCharId === 'new' ? null : (characters.find(c => c.id === editingCharId) ?? null)
  const showCharModal = editingCharId !== null && (editingCharId === 'new' || editingChar !== null)

  const [editingItemId, setEditingItemId] = useState<string | 'new' | null>(null)
  const editingItem = editingItemId === 'new' ? null : (items.find(i => i.id === editingItemId) ?? null)
  const showItemModal = editingItemId !== null && (editingItemId === 'new' || editingItem !== null)

  const [chapterEditingId, setChapterEditingId] = useState<string | null>(null)
  const [chapterEditValue, setChapterEditValue] = useState('')

  const startChapterEdit = (ch: Chapter) => {
    setChapterEditingId(ch.id)
    setChapterEditValue(ch.title)
  }

  const commitChapterEdit = (id: string) => {
    if (chapterEditValue.trim()) onChapterRename?.(id, chapterEditValue.trim())
    setChapterEditingId(null)
  }

  const handleCharSave = (updated: WBCharacter) => {
    if (editingCharId === 'new') {
      onCharactersChange([...characters, updated])
    } else {
      onCharactersChange(characters.map(c => c.id === updated.id ? updated : c))
    }
  }

  const handleItemSave = (updated: WorldItem) => {
    if (editingItemId === 'new') {
      onItemsChange([...items, updated])
    } else {
      onItemsChange(items.map(i => i.id === updated.id ? updated : i))
    }
  }

  // Derived state for the section header
  const sectionMeta = {
    characters: {
      label: 'Characters',
      count: characters.length,
      onAdd: () => setEditingCharId('new'),
      addBg: 'bg-amber-500 hover:bg-amber-400',
    },
    items: {
      label: 'Items',
      count: items.length,
      onAdd: () => setEditingItemId('new'),
      addBg: 'bg-amber-500 hover:bg-amber-400',
    },
    chapters: {
      label: 'Chapters',
      count: (chapters ?? []).length,
      onAdd: onChapterAdd,
      addBg: 'bg-teal-500 hover:bg-teal-400',
    },
  }
  const meta = sectionMeta[tab]

  return (
    <>
      {/* ── Outer shell: icon rail + content panel ── */}
      <div className="w-56 shrink-0 h-full flex border-r border-slate-700">

        {/* Icon rail */}
        <div className="w-10 shrink-0 flex flex-col items-center pt-3 gap-1 bg-slate-950 border-r border-slate-800/60">
          <RailButton
            label="Characters"
            icon={Swords}
            active={tab === 'characters'}
            activeClass="text-amber-400 bg-amber-500/15"
            accentClass="bg-amber-400"
            onClick={() => setTab('characters')}
          />
          <RailButton
            label="Items"
            icon={Package}
            active={tab === 'items'}
            activeClass="text-amber-400 bg-amber-500/15"
            accentClass="bg-amber-400"
            onClick={() => setTab('items')}
          />
          {hasChapters && (
            <RailButton
              label="Chapters"
              icon={BookMarked}
              active={tab === 'chapters'}
              activeClass="text-teal-400 bg-teal-500/15"
              accentClass="bg-teal-400"
              onClick={() => setTab('chapters')}
            />
          )}
        </div>

        {/* Content panel */}
        <div className="flex-1 bg-slate-900 flex flex-col min-w-0">

          {/* Section header */}
          <div className="px-3 py-3 border-b border-slate-700/60 flex items-center justify-between shrink-0">
            <div>
              <span className="text-xs font-semibold text-slate-200">{meta.label}</span>
              {meta.count > 0 && (
                <span className="ml-1.5 text-[10px] text-slate-600 font-normal">{meta.count}</span>
              )}
            </div>
            <button
              onClick={meta.onAdd}
              title={`Add ${meta.label.toLowerCase().slice(0, -1)}`}
              className={`w-6 h-6 rounded-md ${meta.addBg} text-white flex items-center justify-center transition-colors`}
            >
              <Plus size={13} />
            </button>
          </div>

          {/* ── Characters list ── */}
          {tab === 'characters' && (() => {
            const heroes = characters.filter(c => c.characterType !== 'foe')
            const foes = characters.filter(c => c.characterType === 'foe')
            if (characters.length === 0) return (
              <div className="flex-1 overflow-y-auto py-1.5 px-1.5 flex flex-col gap-0.5">
                <div className="flex flex-col items-center gap-3 text-center py-8 px-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Swords size={16} className="text-amber-500/60" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300 mb-1">No characters yet</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Add party members or foes.</p>
                  </div>
                  <button
                    onClick={() => setEditingCharId('new')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
                  >
                    <Plus size={11} /> Add character
                  </button>
                </div>
              </div>
            )
            return (
              <div className="flex-1 overflow-y-auto py-1.5 px-1.5 flex flex-col gap-0.5">
                {/* Heroes */}
                {heroes.map(char => (
                  <button
                    key={char.id}
                    onClick={() => setEditingCharId(char.id)}
                    className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-amber-400">{char.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">{char.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {(char.attributes ?? []).length === 0
                          ? 'No attributes'
                          : `${(char.attributes ?? []).length} attr${(char.attributes ?? []).length !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <ChevronRight size={11} className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
                  </button>
                ))}

                {/* Foe divider + list */}
                {foes.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-1 py-2 mt-1">
                      <div className="flex-1 h-px bg-red-900/40" />
                      <span className="text-[9px] font-bold text-red-700/70 uppercase tracking-wider">Foes</span>
                      <div className="flex-1 h-px bg-red-900/40" />
                    </div>
                    {foes.map(char => (
                      <button
                        key={char.id}
                        onClick={() => setEditingCharId(char.id)}
                        className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-red-950/30 transition-colors text-left group"
                      >
                        <div className="w-7 h-7 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center shrink-0">
                          {char.emoji
                            ? <span className="text-[13px] leading-none">{char.emoji}</span>
                            : <Skull size={12} className="text-red-500/70" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-red-200/80 truncate">{char.name}</div>
                          <div className="text-[10px] text-red-700/60 mt-0.5">HP: {char.foeHp ?? '?'} · dmg: {char.foeDamage ?? 0}</div>
                        </div>
                        <ChevronRight size={11} className="text-slate-700 group-hover:text-red-600/50 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )
          })()}

          {/* ── Items list ── */}
          {tab === 'items' && (
            <div className="flex-1 overflow-y-auto py-1.5 px-1.5 flex flex-col gap-0.5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 text-center py-8 px-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Package size={16} className="text-amber-500/60" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300 mb-1">No items yet</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Define weapons, potions, or key items readers can find and collect.</p>
                  </div>
                  <button
                    onClick={() => setEditingItemId('new')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
                  >
                    <Plus size={11} /> Add item
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setEditingItemId(item.id)}
                    className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 text-sm leading-none">
                      {item.emoji || ITEM_ICON[item.itemType as ItemType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{ITEM_TYPE_LABELS[item.itemType as ItemType]}</div>
                    </div>
                    <ChevronRight size={11} className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── Chapters list ── */}
          {tab === 'chapters' && hasChapters && (
            <>
              <nav className="flex-1 overflow-y-auto py-1.5">
                {(chapters ?? []).length === 0 ? (
                  <div className="flex flex-col items-center gap-3 text-center py-8 px-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <BookMarked size={16} className="text-teal-400/60" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-300 mb-1">No chapters yet</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Break your world into chapters to manage longer narratives.</p>
                    </div>
                    <button
                      onClick={onChapterAdd}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors"
                    >
                      <Plus size={11} /> Add chapter
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 px-1.5">
                    {(chapters ?? []).map((ch, i) => {
                      const active = activeChapterId === ch.id
                      return (
                        <div
                          key={ch.id}
                          className={`group flex items-center gap-1.5 rounded-lg px-2 py-2.5 cursor-pointer transition-colors ${
                            active
                              ? 'bg-teal-600/25 text-teal-300'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                          onClick={() => { if (chapterEditingId !== ch.id) onChapterSelect?.(ch.id) }}
                        >
                          <span className={`text-[10px] font-bold shrink-0 w-4 text-right ${active ? 'text-teal-400' : 'text-slate-600'}`}>
                            {i + 1}
                          </span>

                          {chapterEditingId === ch.id ? (
                            <input
                              autoFocus
                              value={chapterEditValue}
                              onChange={e => setChapterEditValue(e.target.value)}
                              onBlur={() => commitChapterEdit(ch.id)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') commitChapterEdit(ch.id)
                                if (e.key === 'Escape') setChapterEditingId(null)
                              }}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 text-xs bg-slate-700 text-white rounded px-1.5 py-0.5 outline-none min-w-0"
                            />
                          ) : (
                            <span className="flex-1 text-xs font-medium truncate">{ch.title}</span>
                          )}

                          {chapterEditingId !== ch.id && (
                            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                              <button
                                onClick={e => { e.stopPropagation(); startChapterEdit(ch) }}
                                className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                                title="Rename"
                              >
                                <Pencil size={10} />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); onChapterDelete?.(ch.id) }}
                                className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                                title="Delete chapter"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </nav>

              {activeChapterId && (
                <div className="px-3 py-3 border-t border-slate-700">
                  <button
                    onClick={() => onChapterSelect?.(null)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Check size={12} />
                    View all scenes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCharModal && (
        <CharacterModal
          char={editingChar}
          adventureId={adventureId}
          onSave={handleCharSave}
          onDelete={id => onCharactersChange(characters.filter(c => c.id !== id))}
          onClose={() => setEditingCharId(null)}
        />
      )}

      {showItemModal && (
        <ItemModal
          item={editingItem}
          adventureId={adventureId}
          characters={characters}
          onSave={handleItemSave}
          onDelete={id => onItemsChange(items.filter(i => i.id !== id))}
          onClose={() => setEditingItemId(null)}
        />
      )}
    </>
  )
}
