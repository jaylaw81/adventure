'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Plus, Zap, Lock } from 'lucide-react'
import type { Choice } from '@/lib/schema'
import type { WBCharacter, CharacterEffect, ChoiceCondition } from '@/lib/worldBuilder'
import { EFFECT_LABELS, OPERATOR_LABELS } from '@/lib/worldBuilder'

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
        <option value="">— attribute —</option>
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

      <button
        onClick={onDelete}
        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0"
        title="Remove"
      >
        <X size={13} />
      </button>
    </div>
  )
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
    <div className="flex items-center gap-2 group">
      <select
        value={cond.characterId}
        onChange={e => {
          const newChar = characters.find(c => c.id === e.target.value)
          const firstAttr = newChar?.attributes[0]
          onChange({ ...cond, characterId: e.target.value, attributeId: firstAttr?.id ?? '', operator: 'gte', value: 0 })
        }}
        className="text-sm bg-slate-800 text-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-violet-500 flex-1 min-w-0"
      >
        <option value="">— character —</option>
        {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <select
        value={cond.attributeId}
        onChange={e => onChange({ ...cond, attributeId: e.target.value, value: 0 })}
        className="text-sm bg-slate-800 text-slate-300 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-violet-500 w-32 min-w-0"
        disabled={!cond.characterId}
      >
        <option value="">— attribute —</option>
        {(char?.attributes ?? []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <select
        value={cond.operator}
        onChange={e => onChange({ ...cond, operator: e.target.value as ChoiceCondition['operator'] })}
        className="text-sm bg-slate-800 text-slate-300 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-violet-500 w-24 min-w-0"
        disabled={!cond.attributeId}
      >
        {attr?.type === 'text'
          ? <>
              <option value="eq">= (is)</option>
              <option value="neq">≠ (not)</option>
            </>
          : Object.entries(OPERATOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)
        }
      </select>

      <input
        type={attr?.type === 'text' ? 'text' : 'number'}
        value={String(cond.value)}
        onChange={e => onChange({ ...cond, value: attr?.type === 'text' ? e.target.value : parseFloat(e.target.value) || 0 })}
        placeholder="0"
        className="w-20 text-sm bg-slate-800 text-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-violet-500 placeholder-slate-600"
        disabled={!cond.attributeId}
      />

      <button
        onClick={onDelete}
        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0"
        title="Remove"
      >
        <X size={13} />
      </button>
    </div>
  )
}

interface Props {
  choice: Choice
  characters: WBCharacter[]
  adventureId: string
  onClose: () => void
  onLabelChange: (label: string) => void
  onChoiceUpdate: (choice: Choice) => void
}

export default function ChoicePathModal({ choice, characters, adventureId, onClose, onLabelChange, onChoiceUpdate }: Props) {
  const [label, setLabel] = useState(choice.label)
  const [effects, setEffects] = useState<CharacterEffect[]>((choice.characterEffects as CharacterEffect[]) ?? [])
  const [conditions, setConditions] = useState<ChoiceCondition[]>((choice.conditions as ChoiceCondition[]) ?? [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const saveRules = useCallback(async (newEffects: CharacterEffect[], newConditions: ChoiceCondition[]) => {
    const res = await fetch(`/api/adventures/${adventureId}/choices/${choice.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterEffects: newEffects.length > 0 ? newEffects : null,
        conditions: newConditions.length > 0 ? newConditions : null,
      }),
    })
    if (res.ok) onChoiceUpdate(await res.json())
  }, [adventureId, choice.id, onChoiceUpdate])

  const commitLabel = useCallback(() => {
    const trimmed = label.trim() || 'Continue'
    setLabel(trimmed)
    onLabelChange(trimmed)
  }, [label, onLabelChange])

  const handleEffectsChange = (newEffects: CharacterEffect[]) => {
    setEffects(newEffects)
    saveRules(newEffects, conditions)
  }

  const handleConditionsChange = (newConditions: ChoiceCondition[]) => {
    setConditions(newConditions)
    saveRules(effects, newConditions)
  }

  const effectCount = effects.length
  const conditionCount = conditions.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[960px] bg-slate-900 border border-slate-700 rounded-xl flex flex-col max-h-[calc(100dvh-2rem)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-700 shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Zap size={16} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitLabel() } }}
              placeholder="Choice label…"
              className="w-full text-lg font-semibold bg-transparent text-slate-100 placeholder-slate-500 outline-none border-b border-transparent focus:border-amber-500 pb-0.5 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Shown to the reader as a button — edit inline above</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {characters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 py-10 px-6 text-center">
              <p className="text-sm text-slate-400 mb-1">No characters yet</p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Add characters in the left panel first, then return here to configure effects and conditions for this choice.
              </p>
            </div>
          ) : (
            <>
              {/* Effects */}
              <div>
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                      <Zap size={13} className="text-amber-400" />
                      Effects
                      {effectCount > 0 && (
                        <span className="text-xs font-normal text-amber-500 ml-1">{effectCount}</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Applied to characters when the reader selects this choice.</p>
                  </div>
                  <button
                    onClick={() => handleEffectsChange([...effects, { characterId: '', attributeId: '', effect: 'add', value: 0 }])}
                    className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 border border-amber-500/20 transition-colors"
                  >
                    <Plus size={12} /> Add effect
                  </button>
                </div>
                {effects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 py-5 px-4 text-center">
                    <p className="text-xs text-slate-500">No effects — this choice doesn&apos;t change any attributes.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {effects.map((eff, i) => (
                      <EffectRow
                        key={i}
                        effect={eff}
                        characters={characters}
                        onChange={e => handleEffectsChange(effects.map((x, j) => j === i ? e : x))}
                        onDelete={() => handleEffectsChange(effects.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-700/60" />

              {/* Conditions */}
              <div>
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                      <Lock size={13} className="text-violet-400" />
                      Conditions
                      {conditionCount > 0 && (
                        <span className="text-xs font-normal text-violet-400 ml-1">{conditionCount}</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">This choice only appears to the reader when all conditions are met. Leave empty to always show.</p>
                  </div>
                  <button
                    onClick={() => handleConditionsChange([...conditions, { characterId: '', attributeId: '', operator: 'gte', value: 0 }])}
                    className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 hover:text-violet-300 border border-violet-500/20 transition-colors"
                  >
                    <Plus size={12} /> Add condition
                  </button>
                </div>
                {conditions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 py-5 px-4 text-center">
                    <p className="text-xs text-slate-500">No conditions — this choice is always visible.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {conditions.map((cond, i) => (
                      <ConditionRow
                        key={i}
                        cond={cond}
                        characters={characters}
                        onChange={c => handleConditionsChange(conditions.map((x, j) => j === i ? c : x))}
                        onDelete={() => handleConditionsChange(conditions.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-700 gap-3 shrink-0">
          <button
            onClick={onClose}
            className="text-sm px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
