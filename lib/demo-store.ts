import type { Node, Choice } from '@/lib/schema'
import { DEMO_NODES, DEMO_CHOICES, DEMO_ADVENTURE_ID } from '@/lib/demo-story'

const STORAGE_KEY = 'storyquestor_demo'

interface DemoState {
  nodes: Node[]
  choices: Choice[]
}

function load(): DemoState {
  if (typeof window === 'undefined') return { nodes: DEMO_NODES, choices: DEMO_CHOICES }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoState
  } catch { /* ignore */ }
  return { nodes: DEMO_NODES, choices: DEMO_CHOICES }
}

function save(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

export function demoLoad(): DemoState {
  return load()
}

export function demoReset() {
  localStorage.removeItem(STORAGE_KEY)
}

export function demoUpdateNode(nodeId: string, updates: Partial<Node>): Node {
  const state = load()
  const node = state.nodes.find(n => n.id === nodeId)
  if (!node) throw new Error('Node not found')
  const updated = { ...node, ...updates }
  state.nodes = state.nodes.map(n => n.id === nodeId ? updated : n)
  save(state)
  return updated
}

export function demoCreateNode(fields: Omit<Node, 'id' | 'adventureId'>): Node {
  const state = load()
  const node: Node = {
    ...fields,
    id: `demo-node-${Date.now()}`,
    adventureId: DEMO_ADVENTURE_ID,
    imageUrl: null,
  }
  state.nodes = [...state.nodes, node]
  save(state)
  return node
}

export function demoDeleteNode(nodeId: string) {
  const state = load()
  state.nodes = state.nodes.filter(n => n.id !== nodeId)
  state.choices = state.choices.filter(
    c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
  )
  save(state)
}

export function demoCreateChoice(fields: Omit<Choice, 'id' | 'adventureId' | 'orderIndex'>): Choice {
  const state = load()
  const choice: Choice = {
    ...fields,
    id: `demo-choice-${Date.now()}`,
    adventureId: DEMO_ADVENTURE_ID,
    orderIndex: state.choices.filter(c => c.sourceNodeId === fields.sourceNodeId).length,
  }
  state.choices = [...state.choices, choice]
  save(state)
  return choice
}

export function demoUpdateChoice(choiceId: string, label: string): Choice {
  const state = load()
  const choice = state.choices.find(c => c.id === choiceId)
  if (!choice) throw new Error('Choice not found')
  const updated = { ...choice, label }
  state.choices = state.choices.map(c => c.id === choiceId ? updated : c)
  save(state)
  return updated
}

export function demoDeleteChoice(choiceId: string) {
  const state = load()
  state.choices = state.choices.filter(c => c.id !== choiceId)
  save(state)
}
