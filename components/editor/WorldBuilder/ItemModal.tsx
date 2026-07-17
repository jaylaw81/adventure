'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import type { WorldItem, CharacterEffect, ItemType, WBCharacter } from '@/lib/worldBuilder'
import { ITEM_TYPE_LABELS, EFFECT_LABELS } from '@/lib/worldBuilder'

const ITEM_TYPES: ItemType[] = ['item', 'weapon', 'armor', 'ability', 'consumable', 'key']

function EffectRow({
  effect,
  characters,
  onChange,
  onDelete,
}: {
  effect: CharacterEffect
  characters: WBCharacter[]
  onChange: (e: CharacterEffect) => void
  onDelete: () => void
}) {
  const char = characters.find(c => c.id === effect.characterId)
  const attr = char?.attributes.find(a => a.id === effect.attributeId)

  return (
    <div className="flex items-center gap-2 group">
      <select
        value={effect.characterId}
        onChange={e => {
          const newChar = characters.find(c => c.id === e.target.value)
          const firstAttr = newChar?.attributes[0]
          onChange({ ...effect, characterId: e.target.value, attributeId: firstAttr?.id ?? '', effect: 'add', value: 0 })
        }}
        className="text-sm bg-slate-800 text-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-amber-500 flex-1 min-w-0"
      >
        <option value="">— character —</option>
        {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <select
        value={effect.attributeId}
        onChange={e => onChange({ ...effect, attributeId: e.target.value, value: 0 })}
        className="text-sm bg-slate-800 text-slate-300 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-amber-500 w-32 min-w-0"
        disabled={!effect.characterId}
      >
        <option value="">— attr —</option>
        {(char?.attributes ?? []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <select
        value={effect.effect}
        onChange={e => onChange({ ...effect, effect: e.target.value as CharacterEffect['effect'] })}
        className="text-sm bg-slate-800 text-slate-300 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-amber-500 w-24 min-w-0"
        disabled={!effect.attributeId}
      >
        {attr?.type === 'text'
          ? <option value="set">Set to</option>
          : Object.entries(EFFECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)
        }
      </select>

      <input
        type={attr?.type === 'text' ? 'text' : 'number'}
        value={String(effect.value)}
        onChange={e => onChange({ ...effect, value: attr?.type === 'text' ? e.target.value : parseFloat(e.target.value) || 0 })}
        placeholder="0"
        className="w-20 text-sm bg-slate-800 text-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-600"
        disabled={!effect.attributeId}
      />

      <button onClick={onDelete} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0" title="Remove">
        <X size={13} />
      </button>
    </div>
  )
}

interface Props {
  item: WorldItem | null
  adventureId: string
  characters: WBCharacter[]
  onSave: (item: WorldItem) => void
  onDelete?: (itemId: string) => void
  onClose: () => void
}

export default function ItemModal({ item, adventureId, characters, onSave, onDelete, onClose }: Props) {
  const isNew = !item
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [itemType, setItemType] = useState<ItemType>((item?.itemType as ItemType) ?? 'item')
  const [emoji, setEmoji] = useState(item?.emoji ?? '')
  const [effects, setEffects] = useState<CharacterEffect[]>(item?.effects ?? [])
  const [damage, setDamage] = useState<number | null>(item?.damage ?? null)
  const [durabilityMax, setDurabilityMax] = useState<number | null>(item?.durabilityMax ?? null)
  const [durabilityLoss, setDurabilityLoss] = useState<number>(item?.durabilityLoss ?? 1)
  const [reviveAmount, setReviveAmount] = useState<number | null>(item?.reviveAmount ?? null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      itemType,
      effects,
      emoji: emoji.trim() || null,
      damage,
      durabilityMax,
      durabilityLoss: durabilityMax !== null ? durabilityLoss : null,
      reviveAmount,
    }

    if (isNew) {
      const res = await fetch(`/api/adventures/${adventureId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaving(false)
      if (res.ok) { onSave(await res.json()); onClose() }
    } else {
      const res = await fetch(`/api/adventures/${adventureId}/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaving(false)
      if (res.ok) { onSave(await res.json()); onClose() }
    }
  }

  const handleDelete = async () => {
    if (!item) return
    await fetch(`/api/adventures/${adventureId}/items/${item.id}`, { method: 'DELETE' })
    onDelete?.(item.id)
    onClose()
  }

  const typeIcon = emoji.trim() || { item: '📦', weapon: '⚔️', armor: '🛡️', ability: '✨', consumable: '🧪', key: '🗝️' }[itemType]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[680px] bg-slate-900 border border-slate-700 rounded-xl flex flex-col max-h-[calc(100dvh-2rem)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-700 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-xl select-none">
            {typeIcon}
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
              placeholder="Item name…"
              autoFocus={isNew}
              className="w-full text-lg font-semibold bg-transparent text-slate-100 placeholder-slate-500 outline-none border-b border-transparent focus:border-amber-500 pb-0.5 transition-colors"
            />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Type + Emoji row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Type</label>
              <select
                value={itemType}
                onChange={e => setItemType(e.target.value as ItemType)}
                className="w-full text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-amber-500"
              >
                {ITEM_TYPES.map(t => (
                  <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Emoji <span className="text-slate-600 font-normal">(optional icon)</span>
              </label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="e.g. 🗡️ ⚗️ 📜"
                className="w-full text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2.5 placeholder-slate-600 outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Description <span className="text-slate-600 font-normal">(shown to reader when acquired)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A gleaming blade forged in dragon-fire…"
              rows={2}
              className="w-full text-sm bg-slate-800 text-slate-300 rounded-lg px-3 py-2.5 placeholder-slate-600 outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Combat stats */}
          <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 px-4 py-4 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-300">Combat &amp; Durability</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Damage per use
                  <span className="block text-slate-600 font-normal text-[11px]">Weapons: how much damage dealt when used against a foe</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                    <div
                      className={`relative w-7 h-3.5 rounded-full transition-colors ${damage !== null ? 'bg-amber-600' : 'bg-slate-700'}`}
                      onClick={() => setDamage(v => v === null ? 5 : null)}
                    >
                      <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-transform ${damage !== null ? 'translate-x-[14px]' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                  {damage !== null ? (
                    <input
                      type="number"
                      min={0}
                      value={damage}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0) setDamage(v) }}
                      className="flex-1 text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <span className="text-xs text-slate-600">No damage</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Durability
                  <span className="block text-slate-600 font-normal text-[11px]">Limited uses before this item is spent/broken</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                    <div
                      className={`relative w-7 h-3.5 rounded-full transition-colors ${durabilityMax !== null ? 'bg-amber-600' : 'bg-slate-700'}`}
                      onClick={() => setDurabilityMax(v => v === null ? 5 : null)}
                    >
                      <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-transform ${durabilityMax !== null ? 'translate-x-[14px]' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                  {durabilityMax !== null ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        min={1}
                        value={durabilityMax}
                        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setDurabilityMax(v) }}
                        className="w-16 text-sm bg-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-amber-500 text-center"
                      />
                      <span className="text-xs text-slate-500 shrink-0">uses, −</span>
                      <input
                        type="number"
                        min={1}
                        max={durabilityMax}
                        value={durabilityLoss}
                        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setDurabilityLoss(v) }}
                        className="w-12 text-sm bg-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-amber-500 text-center"
                      />
                      <span className="text-xs text-slate-500 shrink-0">/use</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">Unlimited</span>
                  )}
                </div>
              </div>
            </div>
            {/* Revive */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Revive fallen characters
                <span className="block text-slate-600 font-normal text-[11px]">Potions and magic items that can bring a fallen party member back during combat</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                  <div
                    className={`relative w-7 h-3.5 rounded-full transition-colors ${reviveAmount !== null ? 'bg-emerald-600' : 'bg-slate-700'}`}
                    onClick={() => setReviveAmount(v => v === null ? 50 : null)}
                  >
                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-transform ${reviveAmount !== null ? 'translate-x-[14px]' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-400">Can revive</span>
                </label>
                {reviveAmount !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">restore</span>
                    <input
                      type="number"
                      min={1}
                      value={reviveAmount}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setReviveAmount(v) }}
                      className="w-16 text-sm bg-slate-800 text-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                    />
                    <span className="text-xs text-slate-500">HP on revive</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Effects on characters */}
          <div>
            <div className="flex items-start justify-between mb-3 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Character effects when acquired</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {characters.length === 0
                    ? 'Add characters first to define attribute effects.'
                    : 'What happens to characters when this item is picked up.'}
                </p>
              </div>
              {characters.length > 0 && (
                <button
                  onClick={() => setEffects(prev => [...prev, { characterId: '', attributeId: '', effect: 'add', value: 0 }])}
                  className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 border border-amber-500/20 transition-colors"
                >
                  <Plus size={12} /> Add effect
                </button>
              )}
            </div>

            {effects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 py-5 px-4 text-center">
                <p className="text-xs text-slate-500">
                  {characters.length === 0
                    ? 'No characters defined yet — add characters in the panel first.'
                    : 'No effects — picking up this item won\'t change any attributes.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {effects.map((eff, i) => (
                  <EffectRow
                    key={i}
                    effect={eff}
                    characters={characters}
                    onChange={e => setEffects(prev => prev.map((x, j) => j === i ? e : x))}
                    onDelete={() => setEffects(prev => prev.filter((_, j) => j !== i))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center px-6 py-4 border-t border-slate-700 gap-3 shrink-0">
          {!isNew && !deleteConfirm && (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors mr-auto"
            >
              <Trash2 size={12} /> Delete item
            </button>
          )}
          {deleteConfirm && (
            <div className="flex items-center gap-3 mr-auto">
              <span className="text-xs text-red-400">Delete {item?.name}?</span>
              <button onClick={handleDelete} className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(false)} className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">Cancel</button>
            </div>
          )}
          {isNew && <div className="mr-auto" />}

          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            <Check size={14} />
            {saving ? 'Saving…' : isNew ? 'Create item' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
