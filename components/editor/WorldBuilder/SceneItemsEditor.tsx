'use client'

import { X, Plus, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { WorldItem, SceneItemPickup, WBCharacter, ChoiceCondition } from '@/lib/worldBuilder'
import { ITEM_TYPE_ICONS, OPERATOR_LABELS } from '@/lib/worldBuilder'

function genId() {
  return crypto.randomUUID()
}

function ConditionRow({
  cond,
  characters,
  onChange,
  onDelete,
}: {
  cond: ChoiceCondition
  characters: WBCharacter[]
  onChange: (c: ChoiceCondition) => void
  onDelete: () => void
}) {
  const char = characters.find(c => c.id === cond.characterId)
  const attr = char?.attributes.find(a => a.id === cond.attributeId)

  return (
    <div className="flex items-center gap-1 group">
      <select
        value={cond.characterId}
        onChange={e => {
          const newChar = characters.find(c => c.id === e.target.value)
          const firstAttr = newChar?.attributes[0]
          onChange({ ...cond, characterId: e.target.value, attributeId: firstAttr?.id ?? '', operator: 'gte', value: 0 })
        }}
        className="text-[11px] bg-white text-gray-700 border border-gray-300 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-amber-500 flex-1 min-w-0"
      >
        <option value="">— char —</option>
        {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select
        value={cond.attributeId}
        onChange={e => onChange({ ...cond, attributeId: e.target.value, value: 0 })}
        className="text-[11px] bg-white text-gray-700 border border-gray-300 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-amber-500 w-20 min-w-0"
        disabled={!cond.characterId}
      >
        <option value="">— attr —</option>
        {(char?.attributes ?? []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <select
        value={cond.operator}
        onChange={e => onChange({ ...cond, operator: e.target.value as ChoiceCondition['operator'] })}
        className="text-[11px] bg-white text-gray-700 border border-gray-300 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-amber-500 w-16 min-w-0"
        disabled={!cond.attributeId}
      >
        {attr?.type === 'text'
          ? <><option value="eq">is</option><option value="neq">not</option></>
          : Object.entries(OPERATOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)
        }
      </select>
      <input
        type={attr?.type === 'text' ? 'text' : 'number'}
        value={String(cond.value)}
        onChange={e => onChange({ ...cond, value: attr?.type === 'text' ? e.target.value : parseFloat(e.target.value) || 0 })}
        placeholder="0"
        className="w-12 text-[11px] bg-white text-gray-700 border border-gray-300 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-amber-500"
        disabled={!cond.attributeId}
      />
      <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0">
        <X size={10} />
      </button>
    </div>
  )
}

function PickupRow({
  pickup,
  worldItems,
  characters,
  onChange,
  onDelete,
}: {
  pickup: SceneItemPickup
  worldItems: WorldItem[]
  characters: WBCharacter[]
  onChange: (p: SceneItemPickup) => void
  onDelete: () => void
}) {
  const [condOpen, setCondOpen] = useState(false)
  const item = worldItems.find(i => i.id === pickup.itemId)
  const itemIcon = item ? (item.emoji || ITEM_TYPE_ICONS[item.itemType as keyof typeof ITEM_TYPE_ICONS] || '📦') : '📦'
  const conditions = pickup.conditions ?? []

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Item + label row */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span className="text-base shrink-0">{itemIcon}</span>
        <select
          value={pickup.itemId}
          onChange={e => onChange({ ...pickup, itemId: e.target.value, label: `Pick up ${worldItems.find(i => i.id === e.target.value)?.name ?? 'item'}` })}
          className="text-[11px] bg-white text-gray-700 border border-gray-300 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-amber-500 w-28 min-w-0"
        >
          <option value="">— pick item —</option>
          {worldItems.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <input
          value={pickup.label}
          onChange={e => onChange({ ...pickup, label: e.target.value })}
          placeholder='e.g. "Pick up sword"'
          className="flex-1 text-[11px] bg-white text-gray-700 border border-gray-300 rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-amber-500 min-w-0"
        />
        <button
          onClick={() => setCondOpen(v => !v)}
          className={`p-1 rounded transition-colors shrink-0 ${conditions.length > 0 ? 'text-violet-500' : 'text-gray-400 hover:text-violet-500'}`}
          title="Conditions"
        >
          <Lock size={11} />
          {conditions.length > 0 && (
            <span className="ml-0.5 text-[9px]">{conditions.length}</span>
          )}
        </button>
        {condOpen
          ? <ChevronUp size={11} className="text-gray-400 shrink-0 cursor-pointer" onClick={() => setCondOpen(false)} />
          : null
        }
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0">
          <X size={12} />
        </button>
      </div>

      {/* Conditions panel */}
      {condOpen && (
        <div className="border-t border-gray-100 px-2.5 py-2 bg-violet-50 flex flex-col gap-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-violet-600 flex items-center gap-1">
              <Lock size={9} /> Show only when…
            </span>
            <button
              onClick={() => onChange({ ...pickup, conditions: [...conditions, { characterId: '', attributeId: '', operator: 'gte', value: 0 }] })}
              className="text-[10px] text-violet-500 hover:text-violet-700 flex items-center gap-0.5"
            >
              <Plus size={9} /> Add
            </button>
          </div>
          {conditions.length === 0 && (
            <p className="text-[10px] text-violet-400 italic">Always visible — add a condition to restrict.</p>
          )}
          {conditions.map((cond, i) => (
            <ConditionRow
              key={i}
              cond={cond}
              characters={characters}
              onChange={c => onChange({ ...pickup, conditions: conditions.map((x, j) => j === i ? c : x) })}
              onDelete={() => onChange({ ...pickup, conditions: conditions.filter((_, j) => j !== i) })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  worldItems: WorldItem[]
  characters: WBCharacter[]
  sceneItems: SceneItemPickup[]
  onChange: (items: SceneItemPickup[]) => void
}

export default function SceneItemsEditor({ worldItems, characters, sceneItems, onChange }: Props) {
  if (worldItems.length === 0) {
    return (
      <p className="text-[11px] text-gray-400 italic">
        No items defined yet — add items in the Items tab of the left panel.
      </p>
    )
  }

  const addPickup = () => {
    const first = worldItems[0]
    onChange([...sceneItems, {
      id: genId(),
      itemId: first.id,
      label: `Pick up ${first.name}`,
      conditions: [],
    }])
  }

  if (sceneItems.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-lg border border-dashed border-gray-200 py-4 px-3 text-center">
          <p className="text-[11px] text-gray-400 mb-2">No findable items in this scene.</p>
          <button
            onClick={addPickup}
            className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-medium"
          >
            <Plus size={11} /> Add item pickup
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sceneItems.map((pickup, i) => (
        <PickupRow
          key={pickup.id}
          pickup={pickup}
          worldItems={worldItems}
          characters={characters}
          onChange={updated => onChange(sceneItems.map((x, j) => j === i ? updated : x))}
          onDelete={() => onChange(sceneItems.filter((_, j) => j !== i))}
        />
      ))}
      <button
        onClick={addPickup}
        className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-medium self-start"
      >
        <Plus size={11} /> Add item pickup
      </button>
    </div>
  )
}
