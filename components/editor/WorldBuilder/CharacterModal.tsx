'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, Plus, Trash2, Check, Info, Skull, Sparkles, Loader2 } from 'lucide-react'
import type { WBCharacter, CharacterAttribute } from '@/lib/worldBuilder'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

function ColHeader({ label, tip }: { label: string; tip?: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      {tip && (
        <span title={tip} className="cursor-help">
          <Info size={10} className="text-slate-600 shrink-0" />
        </span>
      )}
    </div>
  )
}

function AttributeRow({
  attr,
  onUpdate,
  onDelete,
}: {
  attr: CharacterAttribute
  onUpdate: (a: CharacterAttribute) => void
  onDelete: () => void
}) {
  return (
    <>
      <input
        value={attr.name}
        onChange={e => onUpdate({ ...attr, name: e.target.value })}
        placeholder="e.g. Hit Points, Gold…"
        className="text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2.5 placeholder-slate-500 outline-none focus:ring-1 focus:ring-amber-500 min-w-0"
      />
      <select
        value={attr.type}
        onChange={e => {
          const type = e.target.value as 'number' | 'text'
          onUpdate({ ...attr, type, value: type === 'number' ? 0 : '', min: undefined, max: undefined })
        }}
        className="text-sm bg-slate-800 text-slate-300 rounded-lg px-2.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500"
      >
        <option value="number">Number</option>
        <option value="text">Text</option>
      </select>
      <input
        type={attr.type === 'number' ? 'number' : 'text'}
        value={String(attr.value)}
        onChange={e =>
          onUpdate({
            ...attr,
            value: attr.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
          })
        }
        placeholder={attr.type === 'number' ? '0' : 'value'}
        className="text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2.5 placeholder-slate-500 outline-none focus:ring-1 focus:ring-amber-500"
      />
      {attr.type === 'number' ? (
        <>
          <input
            type="number"
            value={attr.min ?? ''}
            onChange={e =>
              onUpdate({ ...attr, min: e.target.value === '' ? undefined : parseFloat(e.target.value) })
            }
            placeholder="—"
            className="text-sm bg-slate-800 text-slate-300 rounded-lg px-3 py-2.5 placeholder-slate-600 outline-none focus:ring-1 focus:ring-amber-500"
          />
          <input
            type="number"
            value={attr.max ?? ''}
            onChange={e =>
              onUpdate({ ...attr, max: e.target.value === '' ? undefined : parseFloat(e.target.value) })
            }
            placeholder="—"
            className="text-sm bg-slate-800 text-slate-300 rounded-lg px-3 py-2.5 placeholder-slate-600 outline-none focus:ring-1 focus:ring-amber-500"
          />
        </>
      ) : (
        <div className="col-span-2" />
      )}
      <button
        onClick={onDelete}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        title="Remove attribute"
      >
        <Trash2 size={13} />
      </button>
    </>
  )
}

interface Props {
  char: WBCharacter | null
  adventureId: string
  onSave: (char: WBCharacter) => void
  onDelete?: (charId: string) => void
  onClose: () => void
}

export default function CharacterModal({ char, adventureId, onSave, onDelete, onClose }: Props) {
  const isNew = !char
  const { data: session } = useSession()
  const canGenerateAvatars = (session?.user as { tier?: string; subscriptionInterval?: string } | undefined)?.tier === 'organization'
    || (session?.user as { subscriptionInterval?: string } | undefined)?.subscriptionInterval === 'month'

  const [characterType, setCharacterType] = useState<'hero' | 'foe'>(char?.characterType ?? 'hero')
  const [name, setName] = useState(char?.name ?? '')
  const [description, setDescription] = useState(char?.description ?? '')
  const [emoji, setEmoji] = useState(char?.emoji ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(char?.avatarUrl ?? null)
  const [attributes, setAttributes] = useState<CharacterAttribute[]>(char?.attributes ?? [])
  const [healthAttributeId, setHealthAttributeId] = useState<string | null>(char?.healthAttributeId ?? null)
  const [armorAttributeId, setArmorAttributeId] = useState<string | null>(char?.armorAttributeId ?? null)
  const [inventoryCapacity, setInventoryCapacity] = useState<number | null>(char?.inventoryCapacity ?? null)
  // Foe-specific
  const [foeHp, setFoeHp] = useState<number>(char?.foeHp ?? 10)
  const [foeDamage, setFoeDamage] = useState<number>(char?.foeDamage ?? 2)
  const [foeDefeatText, setFoeDefeatText] = useState(char?.foeDefeatText ?? '')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const isFoe = characterType === 'foe'

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const addAttribute = () => {
    setAttributes(prev => [...prev, { id: genId(), name: '', type: 'number', value: 0 }])
  }

  const handleGenerateAvatar = async () => {
    if (!char || generating) return
    setGenerating(true)
    setGenerateError(null)
    const res = await fetch(`/api/adventures/${adventureId}/characters/${char.id}/avatar`, { method: 'POST' })
    if (res.ok) {
      const updated = await res.json() as WBCharacter
      setAvatarUrl(updated.avatarUrl)
      onSave(updated)
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string }
      setGenerateError(data.error ?? 'Generation failed. Try again.')
    }
    setGenerating(false)
  }

  const handleRemoveAvatar = async () => {
    if (!char) return
    const res = await fetch(`/api/adventures/${adventureId}/characters/${char.id}/avatar`, { method: 'DELETE' })
    if (res.ok) {
      const updated = await res.json() as WBCharacter
      setAvatarUrl(null)
      onSave(updated)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      emoji: emoji.trim() || null,
      characterType,
      attributes: isFoe ? [] : attributes,
      inventoryCapacity: isFoe ? null : inventoryCapacity,
      foeHp: isFoe ? foeHp : null,
      foeDamage: isFoe ? foeDamage : null,
      foeDefeatText: isFoe ? (foeDefeatText.trim() || null) : null,
      healthAttributeId: isFoe ? null : (healthAttributeId || null),
      armorAttributeId: isFoe ? null : (armorAttributeId || null),
    }

    if (isNew) {
      const res = await fetch(`/api/adventures/${adventureId}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaving(false)
      if (res.ok) {
        onSave(await res.json())
        onClose()
      }
    } else {
      const res = await fetch(`/api/adventures/${adventureId}/characters/${char.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaving(false)
      if (res.ok) {
        onSave(await res.json())
        onClose()
      }
    }
  }

  const handleDelete = async () => {
    if (!char) return
    await fetch(`/api/adventures/${adventureId}/characters/${char.id}`, { method: 'DELETE' })
    onDelete?.(char.id)
    onClose()
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const avatarBg = isFoe ? 'bg-red-900/40 border-red-500/40' : 'bg-amber-500/20 border-amber-500/40'
  const avatarText = isFoe ? 'text-red-400' : 'text-amber-400'
  const accentRing = isFoe ? 'focus:ring-red-500' : 'focus:ring-amber-500'
  const saveBg = isFoe ? 'bg-red-700 hover:bg-red-600' : 'bg-amber-600 hover:bg-amber-500'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[960px] bg-slate-900 border border-slate-700 rounded-xl flex flex-col max-h-[calc(100dvh-2rem)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-700 shrink-0">
          {/* Avatar area */}
          <div className="relative shrink-0 group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || 'Avatar'}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full ${avatarBg} border-2 flex items-center justify-center`}>
                {isFoe && !name.trim()
                  ? <Skull size={18} className={avatarText} />
                  : <span className={`text-lg font-bold ${avatarText}`}>{initial}</span>
                }
              </div>
            )}
            {/* Hover overlay for remove (existing avatar only) */}
            {avatarUrl && !isNew && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Remove avatar"
              >
                <X size={14} className="text-white" />
              </button>
            )}
          </div>

          {/* Name + generate button */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
              placeholder={isFoe ? 'Foe name…' : 'Character name…'}
              autoFocus={isNew}
              className={`w-full text-lg font-semibold bg-transparent text-slate-100 placeholder-slate-500 outline-none border-b border-transparent focus:border-${isFoe ? 'red' : 'amber'}-500 pb-0.5 transition-colors`}
            />
            {/* Avatar generate / state */}
            {isNew ? (
              <p className="text-[11px] text-slate-600">Save this character first to generate an AI avatar</p>
            ) : !canGenerateAvatars ? (
              <p className="text-[11px] text-slate-600">AI avatar generation requires a monthly subscription</p>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAvatar}
                  disabled={generating}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    isFoe
                      ? 'bg-red-900/40 hover:bg-red-900/60 text-red-300/80 border border-red-700/30'
                      : 'bg-amber-900/40 hover:bg-amber-900/60 text-amber-300/80 border border-amber-700/30'
                  }`}
                >
                  {generating
                    ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
                    : <><Sparkles size={11} /> {avatarUrl ? 'Regenerate avatar' : 'Generate avatar'}</>
                  }
                </button>
                {generateError && (
                  <span className="text-[11px] text-red-400">{generateError}</span>
                )}
              </div>
            )}
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

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Character type</label>
            <div className="inline-flex rounded-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => setCharacterType('hero')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  !isFoe
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚔ Party Member
              </button>
              <button
                onClick={() => setCharacterType('foe')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-700 ${
                  isFoe
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                💀 Foe / Villain
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              {isFoe ? 'Description' : 'Description'}{' '}
              <span className="text-slate-600 font-normal">
                {isFoe ? '(shown dramatically when the reader meets this foe)' : '(optional)'}
              </span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isFoe
                ? 'A towering ogre with cracked yellow tusks and burning red eyes…'
                : 'A brief description of this character — who they are in the story…'
              }
              rows={isFoe ? 3 : 2}
              className={`w-full text-sm bg-slate-800 text-slate-300 rounded-lg px-3 py-2.5 placeholder-slate-600 outline-none focus:ring-1 ${accentRing} resize-none`}
            />
          </div>

          {/* Emoji (for foes especially) */}
          {isFoe && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Icon <span className="text-slate-600 font-normal">(emoji displayed during encounter)</span>
              </label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="e.g. 👹 💀 🐉 🧙 👺"
                className={`w-full text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2.5 placeholder-slate-600 outline-none focus:ring-1 ${accentRing}`}
              />
            </div>
          )}

          {/* ── FOE-SPECIFIC FIELDS ── */}
          {isFoe && (
            <>
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-5 py-4 flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                  <Skull size={13} /> Combat Stats
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Hit Points (HP)
                      <span className="block text-slate-600 font-normal">How much total damage the foe can take</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={foeHp}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setFoeHp(v) }}
                      className="w-full text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Damage per Round
                      <span className="block text-slate-600 font-normal">How much damage the foe deals back (0 = passive)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={9999}
                      value={foeDamage}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0) setFoeDamage(v) }}
                      className="w-full text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Defeat text <span className="text-slate-600 font-normal">(optional — shown when the foe is conquered)</span>
                  </label>
                  <textarea
                    value={foeDefeatText}
                    onChange={e => setFoeDefeatText(e.target.value)}
                    placeholder="With a final roar, the beast collapses to the ground…"
                    rows={2}
                    className="w-full text-sm bg-slate-800 text-slate-300 rounded-lg px-3 py-2.5 placeholder-slate-600 outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/50 border border-slate-700/60 px-4 py-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="text-slate-400 font-medium">Tip:</span>{' '}
                  Open any scene in the editor and use the{' '}
                  <span className="text-red-400/80 font-medium">Foe in this Scene</span>{' '}
                  section to place this foe. Set a "Run Away" path so readers can escape to safety if they choose to flee.
                </p>
              </div>
            </>
          )}

          {/* ── HERO-SPECIFIC FIELDS ── */}
          {!isFoe && (
            <>
              {/* Inventory capacity */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Item slots <span className="text-slate-600 font-normal">(how many loot items this character can carry)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className={`relative w-8 h-4 rounded-full transition-colors ${inventoryCapacity !== null ? 'bg-amber-600' : 'bg-slate-700'}`}
                      onClick={() => setInventoryCapacity(v => v === null ? 5 : null)}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${inventoryCapacity !== null ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm text-slate-300">Limit inventory</span>
                  </label>
                  {inventoryCapacity !== null && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={inventoryCapacity}
                        onChange={e => {
                          const v = parseInt(e.target.value)
                          if (!isNaN(v) && v > 0) setInventoryCapacity(v)
                        }}
                        className="w-16 text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-500 text-center"
                      />
                      <span className="text-xs text-slate-500">item{inventoryCapacity !== 1 ? 's' : ''} max</span>
                    </div>
                  )}
                  {inventoryCapacity === null && (
                    <span className="text-xs text-slate-600">Unlimited</span>
                  )}
                </div>
              </div>

              {/* Attributes */}
              <div>
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Attributes</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Stats tracked as readers make choices — HP, Gold, Strength, Alignment, etc.
                    </p>
                  </div>
                  <button
                    onClick={addAttribute}
                    className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 border border-amber-500/20 transition-colors"
                  >
                    <Plus size={12} /> Add attribute
                  </button>
                </div>

                {attributes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 py-8 px-6 text-center">
                    <p className="text-sm text-slate-400 mb-1">No attributes yet</p>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Add stats like HP, Gold, or Strength. They appear in the reader&apos;s sidebar and can be raised or lowered by story choices.
                    </p>
                    <button
                      onClick={addAttribute}
                      className="mt-4 flex items-center gap-1.5 mx-auto text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 transition-colors"
                    >
                      <Plus size={12} /> Add first attribute
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-[1fr,160px,110px,100px,100px,40px] gap-x-3 gap-y-2 items-center">
                    <ColHeader label="Attribute name" />
                    <ColHeader label="Type" tip="Number: a trackable stat like HP or Gold, with optional progress bar. Text: a fixed label or state like Class or Title." />
                    <ColHeader label="Start" tip="The attribute's value at the beginning of the story." />
                    <ColHeader label="Min" tip="Lowest possible value. When set alongside Max, readers see a color-coded progress bar." />
                    <ColHeader label="Max" tip="Highest possible value. When set alongside Min, readers see a color-coded progress bar." />
                    <div />
                    <div className="col-span-6 h-px bg-slate-700/60" />
                    {attributes.map((attr, i) => (
                      <AttributeRow
                        key={attr.id}
                        attr={attr}
                        onUpdate={a => setAttributes(prev => prev.map((x, j) => j === i ? a : x))}
                        onDelete={() => setAttributes(prev => prev.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Health & Armor designation — only when numeric attributes exist */}
              {attributes.filter(a => a.type === 'number').length > 0 && (
                <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 px-5 py-4 flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-amber-300/80">Combat health</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Designate which attributes track health and armor for foe encounters. Armor absorbs damage first; when health reaches its minimum the character falls and must be revived.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Health attribute</label>
                      <select
                        value={healthAttributeId ?? ''}
                        onChange={e => {
                          const v = e.target.value || null
                          setHealthAttributeId(v)
                          if (v && armorAttributeId === v) setArmorAttributeId(null)
                        }}
                        className="w-full text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">— none —</option>
                        {attributes.filter(a => a.type === 'number').map(a => (
                          <option key={a.id} value={a.id}>{a.name || '(unnamed)'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Armor attribute <span className="text-slate-600 font-normal">(optional)</span></label>
                      <select
                        value={armorAttributeId ?? ''}
                        onChange={e => setArmorAttributeId(e.target.value || null)}
                        className="w-full text-sm bg-slate-800 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">— none —</option>
                        {attributes.filter(a => a.type === 'number' && a.id !== healthAttributeId).map(a => (
                          <option key={a.id} value={a.id}>{a.name || '(unnamed)'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="text-slate-400 font-medium">Tip:</span>{' '}
                  Once saved, open any scene in the editor and use the{' '}
                  <span className="text-amber-400/80 font-medium">Character Paths</span>{' '}
                  section to define how each choice changes these attributes — e.g. &quot;subtract 10 HP when the player fights&quot; or &quot;add 50 Gold when they find treasure.&quot;
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center px-6 py-4 border-t border-slate-700 gap-3 shrink-0">
          {!isNew && !deleteConfirm && (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors mr-auto"
            >
              <Trash2 size={12} /> Delete {isFoe ? 'foe' : 'character'}
            </button>
          )}
          {deleteConfirm && (
            <div className="flex items-center gap-3 mr-auto">
              <span className="text-xs text-red-400">Delete {char?.name}? This cannot be undone.</span>
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          {isNew && <div className="mr-auto" />}

          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || (isFoe && foeHp < 1)}
            className={`flex items-center gap-2 text-sm px-5 py-2 rounded-lg ${saveBg} disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors`}
          >
            <Check size={14} />
            {saving ? 'Saving…' : isNew ? `Create ${isFoe ? 'foe' : 'character'}` : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
