export interface CharacterAttribute {
  id: string
  name: string
  type: 'number' | 'text'
  value: number | string
  min?: number
  max?: number
}

export interface WBCharacter {
  id: string
  adventureId: string
  name: string
  description: string | null
  attributes: CharacterAttribute[]
  inventoryCapacity: number | null
  characterType: 'hero' | 'foe'
  foeHp: number | null
  foeDamage: number | null
  foeDefeatText: string | null
  emoji: string | null
  avatarUrl: string | null
  healthAttributeId: string | null
  armorAttributeId: string | null
  orderIndex: number
  createdAt: string | Date
}

// Per-character inventory: charId → itemIds they're carrying. '__global' key for no-character stories.
export type CharacterInventory = Record<string, string[]>

export interface CharacterEffect {
  characterId: string
  attributeId: string
  effect: 'set' | 'add' | 'subtract'
  value: number | string
}

export interface ChoiceCondition {
  characterId: string
  attributeId: string
  operator: 'gte' | 'lte' | 'gt' | 'lt' | 'eq' | 'neq'
  value: number | string
}

export type ItemType = 'item' | 'weapon' | 'armor' | 'ability' | 'consumable' | 'key'

export interface WorldItem {
  id: string
  adventureId: string
  name: string
  description: string | null
  itemType: ItemType
  effects: CharacterEffect[]
  emoji: string | null
  damage: number | null
  durabilityMax: number | null
  durabilityLoss: number | null
  reviveAmount: number | null
  orderIndex: number
  createdAt: string | Date
}

// Combat tracking in sessionStorage
// Record<nodeId, { currentHp: number; defeated: boolean }>
export type FoeStateMap = Record<string, { currentHp: number; defeated: boolean }>
// Record<itemId, currentDurability>
export type ItemDurabilityMap = Record<string, number>

// Stored as JSON on nodes.sceneItems — describes an item pickable in a scene
export interface SceneItemPickup {
  id: string
  itemId: string
  label: string
  conditions: ChoiceCondition[]
}

// Map of characterId → attributeId → current value
export type CharacterState = Record<string, Record<string, number | string>>

export function buildInitialState(characters: WBCharacter[]): CharacterState {
  const state: CharacterState = {}
  for (const char of characters) {
    state[char.id] = {}
    for (const attr of char.attributes) {
      state[char.id][attr.id] = attr.value
    }
  }
  return state
}

export function applyEffects(
  state: CharacterState,
  effects: CharacterEffect[],
  characters: WBCharacter[],
): CharacterState {
  const next: CharacterState = JSON.parse(JSON.stringify(state))
  for (const effect of effects) {
    const char = characters.find(c => c.id === effect.characterId)
    const attr = char?.attributes.find(a => a.id === effect.attributeId)
    if (!char || !attr) continue

    if (!next[char.id]) next[char.id] = {}
    const current = next[char.id][attr.id] ?? attr.value

    if (effect.effect === 'set') {
      next[char.id][attr.id] = effect.value
    } else if (attr.type === 'number') {
      const cur = typeof current === 'number' ? current : parseFloat(String(current)) || 0
      const delta = typeof effect.value === 'number' ? effect.value : parseFloat(String(effect.value)) || 0
      let result = effect.effect === 'add' ? cur + delta : cur - delta
      if (attr.min !== undefined) result = Math.max(attr.min, result)
      if (attr.max !== undefined) result = Math.min(attr.max, result)
      next[char.id][attr.id] = result
    }
  }
  return next
}

export function checkConditions(
  state: CharacterState,
  conditions: ChoiceCondition[],
  characters: WBCharacter[],
): boolean {
  for (const cond of conditions) {
    const char = characters.find(c => c.id === cond.characterId)
    const attr = char?.attributes.find(a => a.id === cond.attributeId)
    if (!char || !attr) continue

    const current = state[char.id]?.[attr.id] ?? attr.value

    if (attr.type === 'number') {
      const cur = typeof current === 'number' ? current : parseFloat(String(current)) || 0
      const threshold = typeof cond.value === 'number' ? cond.value : parseFloat(String(cond.value)) || 0
      const pass = cond.operator === 'gte' ? cur >= threshold
        : cond.operator === 'lte' ? cur <= threshold
        : cond.operator === 'gt' ? cur > threshold
        : cond.operator === 'lt' ? cur < threshold
        : cond.operator === 'eq' ? cur === threshold
        : cur !== threshold
      if (!pass) return false
    } else {
      const curStr = String(current)
      const condStr = String(cond.value)
      if (cond.operator === 'eq' && curStr !== condStr) return false
      if (cond.operator === 'neq' && curStr === condStr) return false
    }
  }
  return true
}

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  item: 'Item',
  weapon: 'Weapon',
  armor: 'Armor',
  ability: 'Ability',
  consumable: 'Consumable',
  key: 'Key Item',
}

export const ITEM_TYPE_ICONS: Record<ItemType, string> = {
  item: '📦',
  weapon: '⚔️',
  armor: '🛡️',
  ability: '✨',
  consumable: '🧪',
  key: '🗝️',
}

// Record<charId, boolean> — true = character has fallen in combat
export type CharacterFallenMap = Record<string, boolean>

export const INVENTORY_KEY = (adventureId: string) => `wb_inventory_${adventureId}`
export const FOE_STATE_KEY = (adventureId: string) => `wb_foes_${adventureId}`
export const ITEM_DURABILITY_KEY = (adventureId: string) => `wb_durability_${adventureId}`
export const FALLEN_KEY = (adventureId: string) => `wb_fallen_${adventureId}`

export const EFFECT_LABELS: Record<CharacterEffect['effect'], string> = {
  set: 'Set to',
  add: 'Add',
  subtract: 'Subtract',
}

export const OPERATOR_LABELS: Record<ChoiceCondition['operator'], string> = {
  gte: '≥ (at least)',
  lte: '≤ (at most)',
  gt: '> (more than)',
  lt: '< (less than)',
  eq: '= (exactly)',
  neq: '≠ (not equal)',
}
