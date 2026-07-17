'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Shield, Package, Skull, Swords, Zap, RotateCcw } from 'lucide-react'
import {
  buildInitialState,
  applyEffects,
  checkConditions,
  INVENTORY_KEY,
  FOE_STATE_KEY,
  ITEM_DURABILITY_KEY,
  FALLEN_KEY,
  ITEM_TYPE_ICONS,
  type WBCharacter,
  type CharacterState,
  type CharacterInventory,
  type WorldItem,
  type SceneItemPickup,
  type ItemType,
  type FoeStateMap,
  type ItemDurabilityMap,
  type CharacterFallenMap,
} from '@/lib/worldBuilder'
import type { CharacterEffect, ChoiceCondition } from '@/lib/worldBuilder'
import type { Choice } from '@/lib/schema'

type WBChoice = Choice

// ── Combat phases ─────────────────────────────────────────────────────────────

type CombatPhase =
  | 'reveal'   // Dramatic foe entrance
  | 'decision' // Fight or run?
  | 'select'   // Choose character + weapon
  | 'result'   // Show round result
  | 'victory'  // Foe defeated

interface CombatRoundResult {
  attackerName: string
  weaponName: string
  damageDealt: number
  foeDamageTaken: number
  foeHpAfter: number
  foeTotalHp: number
  counterDamage: number
  counterTargetName: string
  armorAbsorbed: number
  characterFell: boolean
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  adventureId: string
  nodeId: string
  characters: WBCharacter[]
  worldItems: WorldItem[]
  sceneItemPickups: SceneItemPickup[]
  choices: WBChoice[]
  children: React.ReactNode
  isChapterEnd?: boolean
  isEnding?: boolean
  sceneFoe?: WBCharacter | null
  foeRunAwayNodeId?: string | null
  startNodeId?: string | null
  footer?: React.ReactNode
}

// ── Helper components ─────────────────────────────────────────────────────────

function StatBar({ value, min, max }: { value: number; min?: number; max?: number }) {
  if (min === undefined || max === undefined || max <= min) return null
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const hue = pct > 60 ? 120 : pct > 30 ? 45 : 0
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: `hsl(${hue}, 70%, 55%)` }}
      />
    </div>
  )
}

function FoeHpBar({ current, total }: { current: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (current / total) * 100))
  const color = pct > 60 ? '#ef4444' : pct > 30 ? '#f97316' : '#dc2626'
  return (
    <div className="h-2.5 rounded-full bg-black/40 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

function CharacterCard({
  char,
  state,
  charInventory,
  worldItems,
  isFallen,
}: {
  char: WBCharacter
  state: CharacterState
  charInventory: string[]
  worldItems: WorldItem[]
  isFallen?: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const charState = state[char.id] ?? {}
  const cap = char.inventoryCapacity
  const atCap = cap !== null && cap !== undefined && charInventory.length >= cap

  return (
    <div className={`rounded-xl border overflow-hidden transition-opacity ${isFallen ? 'border-red-500/30 bg-red-950/20 opacity-70' : 'border-white/10 bg-white/5'}`}>
      <button
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {char.avatarUrl ? (
          <img src={char.avatarUrl} alt={char.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-amber-400/30" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-amber-300">{char.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <span className="flex-1 text-sm font-semibold text-left truncate">
          <span className={isFallen ? 'text-red-300/70' : 'text-white/90'}>{char.name}</span>
          {isFallen && <span className="ml-2 text-[10px] font-bold text-red-400/80 uppercase tracking-wide">Fallen</span>}
        </span>
        {cap !== null && cap !== undefined && (
          <span className={`text-[10px] font-semibold shrink-0 ${atCap ? 'text-red-400' : 'text-white/30'}`}>
            {charInventory.length}/{cap}
          </span>
        )}
        {expanded ? <ChevronUp size={12} className="text-white/40 shrink-0" /> : <ChevronDown size={12} className="text-white/40 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-white/10 px-3 py-2 flex flex-col gap-2">
          {char.description && (
            <p className="text-xs text-white/50 leading-relaxed">{char.description}</p>
          )}

          {(char.attributes ?? []).map(attr => {
            const current = charState[attr.id] ?? attr.value
            return (
              <div key={attr.id}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-white/60">{attr.name}</span>
                  <span className={`text-[11px] font-bold ${
                    attr.type === 'number' && attr.min !== undefined && attr.max !== undefined
                      ? Number(current) / (attr.max - attr.min) < 0.3 ? 'text-red-400'
                        : Number(current) / (attr.max - attr.min) < 0.6 ? 'text-amber-400'
                        : 'text-green-400'
                      : 'text-white/80'
                  }`}>
                    {String(current)}{attr.type === 'number' && attr.max !== undefined ? `/${attr.max}` : ''}
                  </span>
                </div>
                {attr.type === 'number' && <StatBar value={Number(current)} min={attr.min} max={attr.max} />}
              </div>
            )
          })}
          {(char.attributes ?? []).length === 0 && charInventory.length === 0 && (
            <p className="text-[11px] text-white/30 italic">No attributes</p>
          )}

          {(charInventory.length > 0 || (cap !== null && cap !== undefined)) && (
            <div className="mt-1 border-t border-white/8 pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <Package size={10} className="text-amber-400/60" />
                  <span className="text-[10px] font-medium text-amber-400/60">Items</span>
                </div>
                {cap !== null && cap !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 h-1 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${atCap ? 'bg-red-400/70' : 'bg-amber-400/50'}`}
                        style={{ width: `${Math.min(100, (charInventory.length / cap) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-semibold ${atCap ? 'text-red-400' : 'text-white/30'}`}>
                      {charInventory.length}/{cap}
                    </span>
                  </div>
                )}
              </div>
              {charInventory.length === 0 ? (
                <p className="text-[10px] text-white/20 italic">Empty</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {charInventory.map(itemId => {
                    const item = worldItems.find(i => i.id === itemId)
                    if (!item) return null
                    const icon = item.emoji || ITEM_TYPE_ICONS[item.itemType as ItemType]
                    return (
                      <div key={itemId} className="flex items-center gap-1.5">
                        <span className="text-xs shrink-0">{icon}</span>
                        <span className="text-[10px] text-amber-200/60 truncate">{item.name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GlobalInventorySection({ itemIds, worldItems }: { itemIds: string[]; worldItems: WorldItem[] }) {
  const [open, setOpen] = useState(true)
  const items = itemIds.map(id => worldItems.find(i => i.id === id)).filter(Boolean) as WorldItem[]
  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <Package size={13} className="text-amber-400 shrink-0" />
        <span className="flex-1 text-sm font-semibold text-amber-300/90 text-left">Inventory</span>
        <span className="text-[10px] text-amber-500 font-medium">{items.length}</span>
        {open ? <ChevronUp size={12} className="text-white/40 shrink-0" /> : <ChevronDown size={12} className="text-white/40 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-amber-500/10 px-3 py-2 flex flex-col gap-1.5">
          {items.map(item => (
            <div key={item.id} className="flex items-start gap-2">
              <span className="text-sm shrink-0 mt-0.5">{item.emoji || ITEM_TYPE_ICONS[item.itemType as ItemType]}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-amber-200/80 truncate">{item.name}</p>
                {item.description && (
                  <p className="text-[10px] text-white/40 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Sidebar({ characters, state, inventory, worldItems, fallenMap }: {
  characters: WBCharacter[]
  state: CharacterState
  inventory: CharacterInventory
  worldItems: WorldItem[]
  fallenMap: CharacterFallenMap
}) {
  const [open, setOpen] = useState(true)
  const globalItems = inventory['__global'] ?? []

  return (
    <div className="w-64 shrink-0">
      <button
        className="lg:hidden w-full flex items-center justify-between px-4 py-2 mb-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/70"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-amber-400" />
          Party Status
        </div>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      <div className={`flex-col gap-3 ${open ? 'flex' : 'hidden lg:flex'}`}>
        <div className="hidden lg:flex items-center gap-2 px-1 mb-1">
          <Shield size={13} className="text-amber-400" />
          <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Party</span>
        </div>
        {characters.filter(c => c.characterType !== 'foe').map(char => (
          <CharacterCard
            key={char.id}
            char={char}
            state={state}
            charInventory={inventory[char.id] ?? []}
            worldItems={worldItems}
            isFallen={!!fallenMap[char.id]}
          />
        ))}
        {globalItems.length > 0 && (
          <GlobalInventorySection itemIds={globalItems} worldItems={worldItems} />
        )}
      </div>
    </div>
  )
}

function ItemPickupCard({
  pickup,
  item,
  isAcquired,
  characters,
  inventory,
  onPickup,
  staggerIndex,
}: {
  pickup: SceneItemPickup
  item: WorldItem
  isAcquired: boolean
  characters: WBCharacter[]
  inventory: CharacterInventory
  onPickup: (charId: string | null) => void
  staggerIndex: number
}) {
  const [isBursting, setIsBursting] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const itemIcon = item.emoji || ITEM_TYPE_ICONS[item.itemType as ItemType]

  const canCharPickup = (char: WBCharacter) => {
    const cap = char.inventoryCapacity
    if (cap === null || cap === undefined) return true
    return (inventory[char.id] ?? []).length < cap
  }

  const heroChars = characters.filter(c => c.characterType !== 'foe')
  const singleChar = heroChars.length === 1 ? heroChars[0] : null
  const singleCharFull = singleChar ? !canCharPickup(singleChar) : false

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPicker(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showPicker])

  const doPickup = (charId: string | null) => {
    setIsBursting(true)
    setShowPicker(false)
    setTimeout(() => onPickup(charId), 150)
    setTimeout(() => setIsBursting(false), 700)
  }

  const handleTakeClick = () => {
    if (isAcquired) return
    if (heroChars.length === 0) {
      doPickup(null)
    } else if (singleChar) {
      if (singleCharFull) return
      doPickup(singleChar.id)
    } else {
      setShowPicker(v => !v)
    }
  }

  return (
    <div className="flex flex-col" style={{ animationDelay: `${staggerIndex * 80}ms` }}>
      <div
        className={`loot-card relative flex ${showPicker ? 'rounded-t-xl' : 'rounded-xl'} border border-amber-400/20`}
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(28,8,56,0.42) 100%)' }}
      >
        {!isAcquired && (
          <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
            <div className="loot-shimmer-strip" style={{ animationDelay: `${1.5 + staggerIndex * 0.7}s` }} />
          </div>
        )}

        <div
          className="relative flex items-center justify-center shrink-0"
          style={{ width: 88, background: 'rgba(0,0,0,0.22)', borderRight: '1px solid rgba(251,191,36,0.1)' }}
        >
          {isBursting && <div className="loot-burst-ring" />}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all duration-500 ${isAcquired ? '' : 'loot-glow-ring'}`}
            style={isAcquired ? { opacity: 0.32, filter: 'grayscale(0.6)' } : undefined}
          >
            {itemIcon}
          </div>
        </div>

        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-[15px] font-semibold leading-snug transition-colors duration-500 ${isAcquired ? 'text-amber-300/35' : 'text-amber-100'}`}>
              {item.name}
            </p>
            {item.description && (
              <p className={`text-xs mt-1 leading-relaxed line-clamp-2 transition-colors duration-500 ${isAcquired ? 'text-white/20' : 'text-white/50'}`}>
                {item.description}
              </p>
            )}
          </div>

          {isAcquired ? (
            <div className="loot-stamp-in inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500/55 self-start">
              <span>✦</span> Acquired
            </div>
          ) : singleCharFull ? (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400/70 self-start">
              <span>⊘</span> {singleChar!.name}&apos;s inventory is full
            </div>
          ) : (
            <button
              onClick={handleTakeClick}
              className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                showPicker
                  ? 'bg-amber-300 text-amber-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-amber-950 active:scale-95'
              }`}
            >
              ✦ {heroChars.length > 1 ? 'Take it' : pickup.label}
              {heroChars.length > 1 && (
                <span className={`transition-transform duration-200 ${showPicker ? 'rotate-180' : ''}`}>▾</span>
              )}
            </button>
          )}
        </div>
      </div>

      {showPicker && (
        <div className="border border-t-0 border-amber-400/20 rounded-b-xl overflow-hidden">
          <div className="bg-black/40 px-3 py-2.5 flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold text-amber-500/50 tracking-wide mb-0.5">Who picks this up?</p>
            {heroChars.map(char => {
              const held = (inventory[char.id] ?? []).length
              const cap = char.inventoryCapacity
              const atCap = !canCharPickup(char)
              return (
                <button
                  key={char.id}
                  disabled={atCap}
                  onClick={() => !atCap && doPickup(char.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                    atCap
                      ? 'bg-white/3 text-white/25 cursor-not-allowed'
                      : 'bg-white/5 hover:bg-amber-500/15 text-white/80 hover:text-amber-100 active:scale-[0.98]'
                  }`}
                >
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-amber-400/30" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-amber-300">{char.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="flex-1 text-xs font-medium truncate">{char.name}</span>
                  <span className={`text-[10px] font-semibold shrink-0 tabular-nums ${atCap ? 'text-red-400/60' : 'text-white/30'}`}>
                    {cap == null ? `${held}/∞` : `${held}/${cap}`}
                  </span>
                  {atCap
                    ? <span className="text-[9px] font-semibold text-red-400/50 uppercase tracking-wide">full</span>
                    : <span className="text-amber-400/50 text-xs">→</span>
                  }
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Foe Encounter ─────────────────────────────────────────────────────────────

function FoeEncounter({
  foe,
  nodeId,
  characters,
  inventory,
  worldItems,
  charState,
  foeStateMap,
  itemDurability,
  fallenMap,
  foeRunAwayNodeId,
  onFoeDefeated,
  onRunAway,
  onFoeStateChange,
  onItemDurabilityChange,
  onCharStateChange,
  onFallenChange,
}: {
  foe: WBCharacter
  nodeId: string
  characters: WBCharacter[]
  inventory: CharacterInventory
  worldItems: WorldItem[]
  charState: CharacterState
  foeStateMap: FoeStateMap
  itemDurability: ItemDurabilityMap
  fallenMap: CharacterFallenMap
  foeRunAwayNodeId: string | null
  onFoeDefeated: () => void
  onRunAway: () => void
  onFoeStateChange: (map: FoeStateMap) => void
  onItemDurabilityChange: (map: ItemDurabilityMap) => void
  onCharStateChange: (state: CharacterState) => void
  onFallenChange: (map: CharacterFallenMap) => void
}) {
  const heroChars = characters.filter(c => c.characterType !== 'foe')
  const activeHeroes = heroChars.filter(c => !fallenMap[c.id])
  const fallenHeroes = heroChars.filter(c => !!fallenMap[c.id])
  const foeTotalHp = foe.foeHp ?? 10
  const existingState = foeStateMap[nodeId]
  const foeCurrentHp = existingState?.currentHp ?? foeTotalHp

  const [phase, setPhase] = useState<CombatPhase>(existingState?.defeated ? 'victory' : 'reveal')
  const [selectedCharId, setSelectedCharId] = useState<string>(activeHeroes[0]?.id ?? '')
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [combatAction, setCombatAction] = useState<'attack' | 'revive'>('attack')
  const [reviveTargetId, setReviveTargetId] = useState<string>('')
  const [reviveItemId, setReviveItemId] = useState<string>('')
  const [lastResult, setLastResult] = useState<CombatRoundResult | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 120)
    return () => clearTimeout(t)
  }, [])

  const currentDurability = (itemId: string, item: WorldItem): number => {
    if (itemId in itemDurability) return itemDurability[itemId]
    return item.durabilityMax ?? Infinity
  }

  const foeIcon = foe.emoji || '👾'
  const FoeAvatar = ({ size, dimmed }: { size: 'xl' | 'lg' | 'md' | 'sm'; dimmed?: boolean }) => {
    const sizeMap = { xl: 'w-32 h-32', lg: 'w-20 h-20', md: 'w-12 h-12', sm: 'w-8 h-8' }
    const textSizeMap = { xl: 'text-7xl', lg: 'text-5xl', md: 'text-3xl', sm: 'text-xl' }
    if (foe.avatarUrl) {
      return (
        <img
          src={foe.avatarUrl}
          alt={foe.name}
          className={`${sizeMap[size]} rounded-full object-cover border-2 border-red-500/30 select-none transition-all`}
          style={dimmed ? { opacity: 0.4, filter: 'grayscale(0.6)' } : undefined}
        />
      )
    }
    return <div className={`${textSizeMap[size]} select-none`} style={dimmed ? { opacity: 0.4, filter: 'grayscale(0.6)' } : undefined}>{foeIcon}</div>
  }

  const getReviveItems = (charId: string): WorldItem[] => {
    const itemIds = inventory[charId] ?? []
    return itemIds
      .map(id => worldItems.find(i => i.id === id))
      .filter((item): item is WorldItem => !!item && item.reviveAmount !== null && item.reviveAmount !== undefined)
      .filter(item => currentDurability(item.id, item) > 0)
  }

  const canRevive = fallenHeroes.length > 0 && activeHeroes.some(c => getReviveItems(c.id).length > 0)

  const getCharCombatItems = (charId: string): WorldItem[] => {
    const itemIds = inventory[charId] ?? []
    return itemIds
      .map(id => worldItems.find(i => i.id === id))
      .filter((item): item is WorldItem => !!item && item.damage !== null && item.damage !== undefined)
      .filter(item => currentDurability(item.id, item) > 0)
  }

  const handleAttack = () => {
    const attacker = activeHeroes.find(c => c.id === selectedCharId)
    if (!attacker) return
    const weapon = worldItems.find(i => i.id === selectedItemId)
    if (!weapon) return

    const dmg = weapon.damage ?? 1
    const newFoeHp = Math.max(0, foeCurrentHp - dmg)

    // Track item durability
    const lossPerUse = weapon.durabilityLoss ?? 1
    const curDur = currentDurability(weapon.id, weapon)
    const newDurMap: ItemDurabilityMap = { ...itemDurability }
    if (weapon.durabilityMax !== null && weapon.durabilityMax !== undefined) {
      newDurMap[weapon.id] = Math.max(0, (typeof curDur === 'number' && isFinite(curDur) ? curDur : weapon.durabilityMax) - lossPerUse)
    }
    onItemDurabilityChange(newDurMap)

    // Foe counterattack — armor absorbs first, then health; if health depleted → character falls
    const foeDmg = foe.foeDamage ?? 0
    let armorAbsorbed = 0
    let characterFell = false
    let counterTargetName = attacker.name
    let newCharState = charState

    if (foeDmg > 0 && newFoeHp > 0) {
      let remainingDmg = foeDmg

      // Step 1: Drain armor first
      if (attacker.armorAttributeId) {
        const armorAttr = (attacker.attributes ?? []).find(a => a.id === attacker.armorAttributeId)
        if (armorAttr) {
          const cur = Number(newCharState[attacker.id]?.[armorAttr.id] ?? armorAttr.value)
          const minVal = armorAttr.min ?? 0
          const absorbed = Math.min(Math.max(0, cur - minVal), remainingDmg)
          if (absorbed > 0) {
            armorAbsorbed = absorbed
            newCharState = { ...newCharState, [attacker.id]: { ...newCharState[attacker.id], [armorAttr.id]: cur - absorbed } }
            remainingDmg -= absorbed
          }
        }
      }

      // Step 2: Drain health (or fallback to first HP-like attribute)
      if (remainingDmg > 0) {
        if (attacker.healthAttributeId) {
          const healthAttr = (attacker.attributes ?? []).find(a => a.id === attacker.healthAttributeId)
          if (healthAttr) {
            const cur = Number(newCharState[attacker.id]?.[healthAttr.id] ?? healthAttr.value)
            const minVal = healthAttr.min ?? 0
            const newHp = Math.max(minVal, cur - remainingDmg)
            newCharState = { ...newCharState, [attacker.id]: { ...newCharState[attacker.id], [healthAttr.id]: newHp } }
            counterTargetName = `${attacker.name} (${healthAttr.name}: ${newHp}/${healthAttr.max ?? '?'})`
            if (newHp <= minVal) characterFell = true
          }
        } else {
          // Fallback: first numeric attr with max
          const hpAttr = (attacker.attributes ?? []).find(a => a.type === 'number' && a.max !== undefined)
          if (hpAttr) {
            const cur = Number(newCharState[attacker.id]?.[hpAttr.id] ?? hpAttr.value)
            const minVal = hpAttr.min ?? 0
            const newHp = Math.max(minVal, cur - remainingDmg)
            newCharState = { ...newCharState, [attacker.id]: { ...newCharState[attacker.id], [hpAttr.id]: newHp } }
            counterTargetName = `${attacker.name} (${hpAttr.name}: ${newHp}/${hpAttr.max})`
            if (newHp <= minVal) characterFell = true
          }
        }
      }

      onCharStateChange(newCharState)

      if (characterFell) {
        const newFallenMap = { ...fallenMap, [attacker.id]: true }
        onFallenChange(newFallenMap)
      }
    }

    // Update foe state
    const defeated = newFoeHp <= 0
    onFoeStateChange({ ...foeStateMap, [nodeId]: { currentHp: newFoeHp, defeated } })

    setLastResult({
      attackerName: attacker.name,
      weaponName: weapon.name,
      damageDealt: dmg,
      foeDamageTaken: dmg,
      foeHpAfter: newFoeHp,
      foeTotalHp,
      counterDamage: foeDmg,
      counterTargetName,
      armorAbsorbed,
      characterFell,
    })

    if (defeated) {
      setPhase('victory')
    } else {
      setPhase('result')
    }
    setSelectedItemId('')
  }

  const handleRevive = () => {
    const reviveItem = worldItems.find(i => i.id === reviveItemId)
    const target = fallenHeroes.find(c => c.id === reviveTargetId)
    if (!reviveItem || !target) return

    // Use item durability
    const lossPerUse = reviveItem.durabilityLoss ?? 1
    const curDur = currentDurability(reviveItem.id, reviveItem)
    const newDurMap: ItemDurabilityMap = { ...itemDurability }
    if (reviveItem.durabilityMax !== null && reviveItem.durabilityMax !== undefined) {
      newDurMap[reviveItem.id] = Math.max(0, (typeof curDur === 'number' && isFinite(curDur) ? curDur : reviveItem.durabilityMax) - lossPerUse)
    }
    onItemDurabilityChange(newDurMap)

    // Remove from fallen map
    const newFallenMap = { ...fallenMap }
    delete newFallenMap[target.id]
    onFallenChange(newFallenMap)

    // Restore health attribute
    const healthAttrId = target.healthAttributeId
    if (healthAttrId) {
      const healthAttr = target.attributes.find(a => a.id === healthAttrId)
      if (healthAttr) {
        const restoreHp = reviveItem.reviveAmount ?? Math.max(1, Math.floor(((healthAttr.max ?? 0) - (healthAttr.min ?? 0)) * 0.5))
        const newState = { ...charState, [target.id]: { ...charState[target.id], [healthAttrId]: restoreHp } }
        onCharStateChange(newState)
      }
    }

    setReviveTargetId('')
    setReviveItemId('')
    setCombatAction('attack')
    setPhase('decision')
  }

  // ── REVEAL PHASE ──
  if (phase === 'reveal') {
    return (
      <div className={`foe-reveal rounded-2xl overflow-hidden transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ background: 'linear-gradient(160deg, #1a0000 0%, #2d0505 40%, #0f0000 100%)', border: '1px solid rgba(220,38,38,0.25)' }}
      >
        {/* Crimson header strip */}
        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">
          <div className="foe-bg-pulse absolute inset-0 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[0.25em] text-red-500/60 uppercase mb-4">Danger ahead</p>
            <div className="foe-icon-entrance mb-4 flex justify-center"><FoeAvatar size="xl" /></div>
            <h2 className="text-2xl font-bold text-red-100 mb-2" style={{ textShadow: '0 0 24px rgba(239,68,68,0.4)' }}>
              {foe.name}
            </h2>
            {foe.description && (
              <p className="text-sm text-red-200/60 leading-relaxed max-w-sm mx-auto">{foe.description}</p>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="text-xs text-red-400/50">HP</div>
              <div className="w-24">
                <FoeHpBar current={foeCurrentHp} total={foeTotalHp} />
              </div>
              <div className="text-xs text-red-300/60 font-mono">{foeCurrentHp}/{foeTotalHp}</div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={() => setPhase('decision')}
            className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Swords size={16} /> Face the threat
          </button>
        </div>
      </div>
    )
  }

  // ── DECISION PHASE ──
  if (phase === 'decision') {
    return (
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0000 0%, #2d0505 40%, #0f0000 100%)', border: '1px solid rgba(220,38,38,0.25)' }}
      >
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mb-3 flex justify-center"><FoeAvatar size="lg" /></div>
          <h3 className="text-lg font-bold text-red-100">{foe.name}</h3>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="text-xs text-red-400/50">HP</div>
            <div className="w-32"><FoeHpBar current={foeCurrentHp} total={foeTotalHp} /></div>
            <div className="text-xs text-red-300/60 font-mono">{foeCurrentHp}/{foeTotalHp}</div>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-2.5">
          <p className="text-xs text-red-300/40 text-center mb-1">What do you do?</p>
          <button
            onClick={() => setPhase('select')}
            className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Swords size={15} /> Fight
          </button>
          {foeRunAwayNodeId ? (
            <button
              onClick={onRunAway}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              ↩ Run away
            </button>
          ) : (
            <p className="text-center text-[11px] text-red-500/30 italic">No escape route — you must fight.</p>
          )}
        </div>
      </div>
    )
  }

  // ── SELECT PHASE ──
  if (phase === 'select') {
    const selectedChar = activeHeroes.find(c => c.id === selectedCharId)
    const availableWeapons = selectedCharId ? getCharCombatItems(selectedCharId) : []

    // Revive action: who has revive items among active heroes
    const reviveCarrier = activeHeroes.find(c => getReviveItems(c.id).length > 0)
    const reviveItemsAvailable = reviveCarrier ? getReviveItems(reviveCarrier.id) : []

    return (
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0000 0%, #2d0505 40%, #0f0000 100%)', border: '1px solid rgba(220,38,38,0.25)' }}
      >
        <div className="px-4 pt-5 pb-3 flex items-center gap-3 border-b border-red-900/40">
          <FoeAvatar size="md" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-400/60 uppercase tracking-wider">Fighting</p>
            <p className="text-sm font-semibold text-red-100">{foe.name}</p>
          </div>
          <div className="text-right">
            <div className="w-20"><FoeHpBar current={foeCurrentHp} total={foeTotalHp} /></div>
            <p className="text-[10px] text-red-400/50 font-mono mt-0.5">{foeCurrentHp}/{foeTotalHp}</p>
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">

          {/* Action toggle: Attack / Revive */}
          {canRevive && (
            <div className="inline-flex rounded-lg border border-red-900/50 overflow-hidden self-start">
              <button
                onClick={() => setCombatAction('attack')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${combatAction === 'attack' ? 'bg-red-700 text-white' : 'bg-transparent text-red-400/50 hover:text-red-300'}`}
              >
                <Swords size={11} /> Attack
              </button>
              <button
                onClick={() => setCombatAction('revive')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors border-l border-red-900/50 flex items-center gap-1.5 ${combatAction === 'revive' ? 'bg-emerald-800 text-white' : 'bg-transparent text-emerald-400/50 hover:text-emerald-300'}`}
              >
                ✦ Revive
              </button>
            </div>
          )}

          {combatAction === 'revive' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-2">Revive which hero?</label>
                <div className="flex flex-col gap-1.5">
                  {fallenHeroes.map(char => (
                    <button
                      key={char.id}
                      onClick={() => setReviveTargetId(char.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${
                        reviveTargetId === char.id ? 'bg-emerald-900/40 border-emerald-500/40 text-white' : 'bg-white/3 border-white/10 text-white/50 hover:bg-white/8'
                      }`}
                    >
                      {char.avatarUrl ? (
                        <img src={char.avatarUrl} alt={char.name} className="w-7 h-7 rounded-full object-cover shrink-0 opacity-60" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-red-900/40 border border-red-500/30 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-red-300/60">{char.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{char.name}</p>
                        <p className="text-[10px] text-red-400/50">Fallen</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-2">Choose revival item</label>
                <div className="flex flex-col gap-1.5">
                  {reviveItemsAvailable.map(item => {
                    const icon = item.emoji || ITEM_TYPE_ICONS[item.itemType as ItemType]
                    const curDur = currentDurability(item.id, item)
                    return (
                      <button
                        key={item.id}
                        onClick={() => setReviveItemId(item.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                          reviveItemId === item.id ? 'bg-emerald-900/40 border-emerald-500/40' : 'bg-white/3 border-white/10 hover:bg-white/8'
                        }`}
                      >
                        <span className="text-xl shrink-0 select-none">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${reviveItemId === item.id ? 'text-white' : 'text-white/70'}`}>{item.name}</p>
                          <p className="text-[10px] text-white/30 mt-0.5">
                            Restores {item.reviveAmount} HP
                            {item.durabilityMax !== null && item.durabilityMax !== undefined && ` · ${typeof curDur === 'number' && isFinite(curDur) ? curDur : item.durabilityMax}/${item.durabilityMax} uses`}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRevive}
                  disabled={!reviveTargetId || !reviveItemId}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
                >
                  ✦ Revive!
                </button>
                <button onClick={() => setPhase('decision')} className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors" title="Back">↩</button>
              </div>
            </>
          ) : (
            <>
              {activeHeroes.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-red-300/60 mb-2">Who fights?</label>
                  <div className="flex flex-col gap-1.5">
                    {activeHeroes.map(char => {
                      const weapons = getCharCombatItems(char.id)
                      return (
                        <button
                          key={char.id}
                          onClick={() => { setSelectedCharId(char.id); setSelectedItemId('') }}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${
                            selectedCharId === char.id ? 'bg-red-800/40 border-red-500/40 text-white' : 'bg-white/3 border-white/10 text-white/60 hover:bg-white/8'
                          }`}
                        >
                          {char.avatarUrl ? (
                            <img src={char.avatarUrl} alt={char.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-amber-400/30" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-bold text-amber-300">{char.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{char.name}</p>
                            <p className="text-[10px] text-white/30">
                              {weapons.length === 0 ? 'No weapons / abilities' : `${weapons.length} combat item${weapons.length !== 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                    {fallenHeroes.map(char => (
                      <div key={char.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/2 opacity-40">
                        <div className="w-7 h-7 rounded-full bg-red-900/40 border border-red-500/20 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-red-400/50">{char.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/30 truncate">{char.name}</p>
                          <p className="text-[10px] text-red-400/40">Fallen — needs revival</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedChar && (
                <div>
                  <label className="block text-xs font-medium text-red-300/60 mb-2">Choose weapon or ability</label>
                  {availableWeapons.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-red-900/50 py-4 px-3 text-center">
                      <p className="text-xs text-red-400/50">{selectedChar.name} has no weapons or abilities in their inventory.</p>
                      <p className="text-[11px] text-red-500/30 mt-1">Find weapons or abilities in the world to fight foes.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {availableWeapons.map(weapon => {
                        const icon = weapon.emoji || ITEM_TYPE_ICONS[weapon.itemType as ItemType]
                        const curDur = currentDurability(weapon.id, weapon)
                        const maxDur = weapon.durabilityMax
                        return (
                          <button
                            key={weapon.id}
                            onClick={() => setSelectedItemId(weapon.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                              selectedItemId === weapon.id ? 'bg-red-800/40 border-red-500/40' : 'bg-white/3 border-white/10 hover:bg-white/8'
                            }`}
                          >
                            <span className="text-xl shrink-0 select-none">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${selectedItemId === weapon.id ? 'text-white' : 'text-white/70'}`}>{weapon.name}</p>
                              <p className="text-[10px] text-white/30 mt-0.5">
                                {weapon.damage} dmg
                                {maxDur !== null && maxDur !== undefined && ` · ${typeof curDur === 'number' && isFinite(curDur) ? curDur : maxDur}/${maxDur} durability`}
                              </p>
                            </div>
                            {selectedItemId === weapon.id && <Zap size={13} className="text-red-400 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleAttack}
                  disabled={!selectedCharId || !selectedItemId || activeHeroes.length === 0}
                  className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Swords size={14} /> Attack!
                </button>
                <button onClick={() => setPhase('decision')} className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors" title="Back">↩</button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── RESULT PHASE ──
  if (phase === 'result' && lastResult) {
    return (
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0000 0%, #2d0505 40%, #0f0000 100%)', border: '1px solid rgba(220,38,38,0.25)' }}
      >
        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Foe HP */}
          <div className="flex items-center gap-3">
            <FoeAvatar size="md" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-red-300/70">{foe.name}</p>
                <p className="text-xs text-red-400/60 font-mono">{lastResult.foeHpAfter}/{lastResult.foeTotalHp} HP</p>
              </div>
              <FoeHpBar current={lastResult.foeHpAfter} total={lastResult.foeTotalHp} />
            </div>
          </div>

          {/* Attack summary */}
          <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">⚔</span>
              <p className="text-xs text-white/70 leading-relaxed">
                <span className="font-semibold text-white/90">{lastResult.attackerName}</span> strikes with{' '}
                <span className="font-semibold text-amber-200/80">{lastResult.weaponName}</span>
                {' '}— deals <span className="text-red-300 font-bold">{lastResult.damageDealt} damage</span>
              </p>
            </div>
            {lastResult.counterDamage > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">💢</span>
                <p className="text-xs text-white/60 leading-relaxed">
                  <span className="font-semibold text-red-200/80">{foe.name}</span> retaliates for{' '}
                  <span className="text-red-300 font-bold">{lastResult.counterDamage} damage</span>
                  {lastResult.armorAbsorbed > 0 && (
                    <span className="text-slate-400"> ({lastResult.armorAbsorbed} absorbed by armor)</span>
                  )}
                  {' '}→ {lastResult.counterTargetName}
                </p>
              </div>
            )}
            {lastResult.characterFell && (
              <div className="flex items-start gap-2 mt-1 pt-2 border-t border-white/8">
                <span className="text-red-500 mt-0.5">💀</span>
                <p className="text-xs text-red-300/80 font-semibold leading-relaxed">
                  {lastResult.attackerName} has fallen! Find a revival item to bring them back.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase('select')}
              className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={13} /> Continue fighting
            </button>
            {foeRunAwayNodeId && (
              <button
                onClick={onRunAway}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 text-sm transition-colors"
                title="Run away"
              >
                ↩
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── VICTORY PHASE ──
  if (phase === 'victory') {
    return (
      <div className="rounded-2xl overflow-hidden foe-victory"
        style={{ background: 'linear-gradient(160deg, #001a00 0%, #052d05 40%, #000f00 100%)', border: '1px solid rgba(34,197,94,0.25)' }}
      >
        <div className="px-6 py-8 text-center flex flex-col items-center gap-4">
          <FoeAvatar size="lg" dimmed />
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-green-500/60 uppercase mb-2">Victory</p>
            <h3 className="text-xl font-bold text-green-100">{foe.name} defeated!</h3>
            {foe.foeDefeatText && (
              <p className="text-sm text-green-200/50 mt-2 leading-relaxed max-w-sm mx-auto">{foe.foeDefeatText}</p>
            )}
          </div>
          <button
            onClick={onFoeDefeated}
            className="mt-2 px-6 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  return null
}

// ── Main component ─────────────────────────────────────────────────────────────

const STATE_KEY = (id: string) => `wb_state_${id}`

export default function WorldBuilderSceneWrapper({
  adventureId,
  nodeId,
  characters,
  worldItems,
  sceneItemPickups,
  choices,
  children,
  isChapterEnd,
  isEnding,
  sceneFoe,
  foeRunAwayNodeId,
  startNodeId,
  footer,
}: Props) {
  const router = useRouter()
  const [charState, setCharState] = useState<CharacterState>(() => buildInitialState(characters.filter(c => c.characterType !== 'foe')))
  const [inventory, setInventory] = useState<CharacterInventory>({})
  const [acquiredInScene, setAcquiredInScene] = useState<Set<string>>(new Set())
  const [foeStateMap, setFoeStateMap] = useState<FoeStateMap>({})
  const [itemDurability, setItemDurability] = useState<ItemDurabilityMap>({})
  const [fallenMap, setFallenMap] = useState<CharacterFallenMap>({})
  const [foeDefeated, setFoeDefeated] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STATE_KEY(adventureId))
      if (stored) {
        const parsed = JSON.parse(stored) as CharacterState
        const initial = buildInitialState(characters.filter(c => c.characterType !== 'foe'))
        const merged: CharacterState = { ...initial }
        for (const charId of Object.keys(parsed)) {
          if (merged[charId]) merged[charId] = { ...merged[charId], ...parsed[charId] }
        }
        setCharState(merged)
      }
    } catch { /* ignore */ }

    try {
      const storedInv = sessionStorage.getItem(INVENTORY_KEY(adventureId))
      if (storedInv) {
        const parsed = JSON.parse(storedInv)
        if (Array.isArray(parsed)) {
          setInventory({ __global: parsed as string[] })
        } else {
          setInventory(parsed as CharacterInventory)
        }
      }
    } catch { /* ignore */ }

    try {
      const storedFoe = sessionStorage.getItem(FOE_STATE_KEY(adventureId))
      if (storedFoe) {
        const parsed = JSON.parse(storedFoe) as FoeStateMap
        setFoeStateMap(parsed)
        if (sceneFoe && parsed[nodeId]?.defeated) setFoeDefeated(true)
      }
    } catch { /* ignore */ }

    try {
      const storedDur = sessionStorage.getItem(ITEM_DURABILITY_KEY(adventureId))
      if (storedDur) setItemDurability(JSON.parse(storedDur) as ItemDurabilityMap)
    } catch { /* ignore */ }

    try {
      const storedFallen = sessionStorage.getItem(FALLEN_KEY(adventureId))
      if (storedFallen) {
        const parsed = JSON.parse(storedFallen) as CharacterFallenMap
        setFallenMap(parsed)
        const heroes = characters.filter(c => c.characterType !== 'foe')
        if (heroes.length > 0 && heroes.every(c => parsed[c.id])) setGameOver(true)
      }
    } catch { /* ignore */ }
  }, [adventureId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setAcquiredInScene(new Set())
  }, [nodeId])

  const persistState = useCallback((state: CharacterState) => {
    try { sessionStorage.setItem(STATE_KEY(adventureId), JSON.stringify(state)) } catch { /* ignore */ }
  }, [adventureId])

  const persistInventory = useCallback((inv: CharacterInventory) => {
    try { sessionStorage.setItem(INVENTORY_KEY(adventureId), JSON.stringify(inv)) } catch { /* ignore */ }
  }, [adventureId])

  const persistFoeState = useCallback((map: FoeStateMap) => {
    try { sessionStorage.setItem(FOE_STATE_KEY(adventureId), JSON.stringify(map)) } catch { /* ignore */ }
  }, [adventureId])

  const persistDurability = useCallback((map: ItemDurabilityMap) => {
    try { sessionStorage.setItem(ITEM_DURABILITY_KEY(adventureId), JSON.stringify(map)) } catch { /* ignore */ }
  }, [adventureId])

  const persistFallen = useCallback((map: CharacterFallenMap) => {
    try { sessionStorage.setItem(FALLEN_KEY(adventureId), JSON.stringify(map)) } catch { /* ignore */ }
  }, [adventureId])

  const handleFoeStateChange = useCallback((map: FoeStateMap) => {
    setFoeStateMap(map)
    persistFoeState(map)
  }, [persistFoeState])

  const handleItemDurabilityChange = useCallback((map: ItemDurabilityMap) => {
    setItemDurability(map)
    persistDurability(map)
  }, [persistDurability])

  const handleFallenChange = useCallback((map: CharacterFallenMap) => {
    setFallenMap(map)
    persistFallen(map)
    const heroes = characters.filter(c => c.characterType !== 'foe')
    if (heroes.length > 0 && heroes.every(c => map[c.id])) setGameOver(true)
  }, [characters, persistFallen])

  const handleCharStateChange = useCallback((state: CharacterState) => {
    setCharState(state)
    persistState(state)
  }, [persistState])

  const handleTryAgain = useCallback(() => {
    try {
      sessionStorage.removeItem(STATE_KEY(adventureId))
      sessionStorage.removeItem(INVENTORY_KEY(adventureId))
      sessionStorage.removeItem(FOE_STATE_KEY(adventureId))
      sessionStorage.removeItem(ITEM_DURABILITY_KEY(adventureId))
      sessionStorage.removeItem(FALLEN_KEY(adventureId))
    } catch { /* ignore */ }
    if (startNodeId) {
      router.push(`/play/${adventureId}/${startNodeId}`)
    } else {
      router.push('/')
    }
  }, [adventureId, startNodeId, router])

  const handleChoice = useCallback((choice: WBChoice) => {
    const effects = (choice.characterEffects as CharacterEffect[]) ?? []
    if (effects.length > 0) {
      const newState = applyEffects(charState, effects, characters.filter(c => c.characterType !== 'foe'))
      setCharState(newState)
      persistState(newState)
    }
    router.push(`/play/${adventureId}/${choice.targetNodeId}`)
  }, [charState, characters, adventureId, router, persistState])

  const handlePickup = useCallback((pickup: SceneItemPickup, charId: string | null) => {
    const item = worldItems.find(i => i.id === pickup.itemId)
    if (!item) return

    if (item.effects.length > 0) {
      const newState = applyEffects(charState, item.effects, characters.filter(c => c.characterType !== 'foe'))
      setCharState(newState)
      persistState(newState)
    }

    const key = charId ?? '__global'
    const existing = inventory[key] ?? []
    if (existing.includes(item.id)) return
    const newInv: CharacterInventory = { ...inventory, [key]: [...existing, item.id] }
    setInventory(newInv)
    persistInventory(newInv)
    setAcquiredInScene(prev => new Set([...prev, pickup.id]))
  }, [charState, characters, worldItems, inventory, persistState, persistInventory])

  const allAcquiredItemIds = new Set(Object.values(inventory).flat())
  const heroCharacters = characters.filter(c => c.characterType !== 'foe')

  const visibleChoices = choices.filter(choice => {
    const conds = (choice.conditions as ChoiceCondition[]) ?? []
    return checkConditions(charState, conds, heroCharacters)
  })

  const visiblePickups = sceneItemPickups.filter(pickup => {
    const conds = pickup.conditions ?? []
    return checkConditions(charState, conds, heroCharacters)
  })

  const showSidebar = heroCharacters.length > 0

  // Foe is present and not yet defeated in this session
  const activeFoe = sceneFoe && !foeDefeated && !(foeStateMap[nodeId]?.defeated)
  const showFoe = activeFoe && !isChapterEnd && !isEnding

  const itemSection = visiblePickups.length > 0 && !isChapterEnd && !isEnding && !showFoe ? (
    <div className="mt-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.18))' }} />
        <span className="text-amber-500/35 text-xs shrink-0">✦</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(251,191,36,0.18))' }} />
      </div>
      <div className="flex flex-col gap-3">
        {visiblePickups.map((pickup, i) => {
          const item = worldItems.find(wi => wi.id === pickup.itemId)
          if (!item) return null
          const isAcquired = allAcquiredItemIds.has(item.id) || acquiredInScene.has(pickup.id)
          return (
            <ItemPickupCard
              key={pickup.id}
              pickup={pickup}
              item={item}
              isAcquired={isAcquired}
              characters={heroCharacters}
              inventory={inventory}
              onPickup={charId => handlePickup(pickup, charId)}
              staggerIndex={i}
            />
          )
        })}
      </div>
    </div>
  ) : null

  const foeSection = showFoe && sceneFoe ? (
    <div className="mt-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(220,38,38,0.18))' }} />
        <span className="text-red-600/35 text-xs shrink-0">⚠</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(220,38,38,0.18))' }} />
      </div>
      <FoeEncounter
        foe={sceneFoe}
        nodeId={nodeId}
        characters={heroCharacters}
        inventory={inventory}
        worldItems={worldItems}
        charState={charState}
        foeStateMap={foeStateMap}
        itemDurability={itemDurability}
        fallenMap={fallenMap}
        foeRunAwayNodeId={foeRunAwayNodeId ?? null}
        onFoeDefeated={() => setFoeDefeated(true)}
        onRunAway={() => { if (foeRunAwayNodeId) router.push(`/play/${adventureId}/${foeRunAwayNodeId}`) }}
        onFoeStateChange={handleFoeStateChange}
        onItemDurabilityChange={handleItemDurabilityChange}
        onCharStateChange={handleCharStateChange}
        onFallenChange={handleFallenChange}
      />
    </div>
  ) : null

  // Show choices only once foe is defeated (or no foe)
  const choicesReady = !showFoe

  // ── Game Over ─────────────────────────────────────────────────────────────────
  if (gameOver) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-16"
        style={{ background: 'linear-gradient(135deg, #1a0000 0%, #0f0000 50%, #000000 100%)' }}
      >
        <div className="max-w-md w-full text-center flex flex-col items-center gap-8">
          {/* Fallen heroes */}
          <div className="flex justify-center gap-3">
            {heroCharacters.map(char => (
              <div key={char.id} className="flex flex-col items-center gap-1.5">
                {char.avatarUrl ? (
                  <img src={char.avatarUrl} alt={char.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-900/60 grayscale opacity-50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-red-950/50 border-2 border-red-900/40 flex items-center justify-center opacity-50">
                    <span className="text-xl font-bold text-red-400/60">{char.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-[10px] text-red-500/50 font-medium">{char.name}</span>
              </div>
            ))}
          </div>

          {/* Message */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-red-600/50 uppercase mb-3">Party Fallen</p>
            <h2 className="text-3xl font-bold text-red-100/90 mb-4" style={{ textShadow: '0 0 32px rgba(239,68,68,0.3)' }}>
              Your journey ends here…
            </h2>
            <p className="text-base text-red-200/50 leading-relaxed max-w-sm mx-auto">
              A great try! Every legendary adventurer has faced defeat — it&apos;s how you learn the path.
              Rest, regroup, and try again with what you&apos;ve learned. The story is waiting for you.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={handleTryAgain}
              className="w-full py-3.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-colors"
            >
              ↺ Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!showSidebar) {
    return (
      <>
        {children}
        {foeSection}
        {itemSection}
        {choicesReady && !isChapterEnd && !isEnding && visibleChoices.length > 0 && (
          <ChoiceList choices={visibleChoices} allCount={choices.length} onChoose={handleChoice} />
        )}
        {footer}
      </>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 60%, #0f172a 100%)' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {children}
          {foeSection}
          {itemSection}
          {choicesReady && !isChapterEnd && !isEnding && (
            <ChoiceList choices={visibleChoices} allCount={choices.length} onChoose={handleChoice} />
          )}
          {footer}
        </div>
        <Sidebar characters={heroCharacters} state={charState} inventory={inventory} worldItems={worldItems} fallenMap={fallenMap} />
      </div>
    </div>
  )
}

function ChoiceList({
  choices,
  allCount,
  onChoose,
}: {
  choices: WBChoice[]
  allCount: number
  onChoose: (c: WBChoice) => void
}) {
  const hiddenCount = allCount - choices.length

  return (
    <div className="mt-8">
      <p className="text-sm font-medium text-white/50 mb-3">What do you do?</p>
      {choices.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-white/40 text-sm">No choices available on this path.</p>
          {hiddenCount > 0 && (
            <p className="text-white/30 text-xs mt-1">{hiddenCount} path{hiddenCount !== 1 ? 's' : ''} locked by character requirements.</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => onChoose(choice)}
                className="group flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 border-white/10 hover:border-violet-400 bg-white/5 hover:bg-violet-500/10 text-white text-left transition-all"
              >
                <span className="w-6 h-6 rounded-full border border-white/20 group-hover:border-violet-400 text-white/50 group-hover:text-violet-300 text-xs font-bold flex items-center justify-center shrink-0 transition-colors">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{choice.label}</span>
              </button>
            ))}
          </div>
          {hiddenCount > 0 && (
            <p className="text-white/30 text-xs mt-3">
              {hiddenCount} path{hiddenCount !== 1 ? 's are' : ' is'} hidden — character requirements not met.
            </p>
          )}
        </>
      )}
    </div>
  )
}
