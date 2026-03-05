import { eq, sql, and } from 'drizzle-orm'
import { db } from './db'
import { adventures, nodes, choices } from './schema'

export type AdventureWithCounts = Awaited<ReturnType<typeof getAdventures>>[number]

/**
 * Counts all distinct paths from the start node that reach an 'ending' node.
 * Only nodes explicitly typed as 'ending' count as outcomes.
 * Cycles and dead-ends that aren't endings are ignored.
 */
function countOutcomes(
  nodeId: string,
  graph: Map<string, string[]>,
  endingIds: Set<string>,
  path = new Set<string>()
): number {
  if (path.has(nodeId)) return 0 // cycle — stop traversal

  if (endingIds.has(nodeId)) return 1 // reached a real ending

  const children = graph.get(nodeId) ?? []
  if (children.length === 0) return 0 // dead-end that isn't an ending — doesn't count

  path.add(nodeId)
  let total = 0
  for (const childId of children) {
    total += countOutcomes(childId, graph, endingIds, new Set(path))
  }
  return total
}

export async function getAdventures(userEmail: string) {
  const allAdventures = await db
    .select()
    .from(adventures)
    .where(eq(adventures.userEmail, userEmail))
    .orderBy(adventures.createdAt)
  if (allAdventures.length === 0) return []

  // Fetch all nodes and choices across all adventures in 2 queries
  const [allNodes, allChoices] = await Promise.all([
    db.select({ id: nodes.id, adventureId: nodes.adventureId, nodeType: nodes.nodeType }).from(nodes),
    db.select({ adventureId: choices.adventureId, sourceNodeId: choices.sourceNodeId, targetNodeId: choices.targetNodeId }).from(choices),
  ])

  // Group by adventureId
  const nodesByAdventure = new Map<string, typeof allNodes>()
  for (const node of allNodes) {
    if (!nodesByAdventure.has(node.adventureId)) nodesByAdventure.set(node.adventureId, [])
    nodesByAdventure.get(node.adventureId)!.push(node)
  }

  const choicesByAdventure = new Map<string, typeof allChoices>()
  for (const choice of allChoices) {
    if (!choicesByAdventure.has(choice.adventureId)) choicesByAdventure.set(choice.adventureId, [])
    choicesByAdventure.get(choice.adventureId)!.push(choice)
  }

  return allAdventures.map(adventure => {
    const adventureNodes = nodesByAdventure.get(adventure.id) ?? []
    const adventureChoices = choicesByAdventure.get(adventure.id) ?? []

    // Build adjacency list: nodeId -> [targetNodeId]
    const graph = new Map<string, string[]>()
    for (const node of adventureNodes) graph.set(node.id, [])
    for (const choice of adventureChoices) {
      graph.get(choice.sourceNodeId)?.push(choice.targetNodeId)
    }

    const endingIds = new Set(adventureNodes.filter(n => n.nodeType === 'ending').map(n => n.id))
    const startNode = adventureNodes.find(n => n.nodeType === 'start') ?? adventureNodes[0]
    const outcomes = startNode ? countOutcomes(startNode.id, graph, endingIds) : 0

    return { ...adventure, outcomes, sceneCount: adventureNodes.length }
  })
}

export async function getAdventure(id: string) {
  const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
  return adventure ?? null
}

export async function getAdventureByToken(token: string) {
  const [adventure] = await db
    .select()
    .from(adventures)
    .where(eq(adventures.shareToken, token))
  if (!adventure || !adventure.isPublic) return null
  return adventure
}

export async function getAdventureWithData(id: string) {
  const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
  if (!adventure) return null
  const [adventureNodes, adventureChoices] = await Promise.all([
    db.select().from(nodes).where(eq(nodes.adventureId, id)),
    db.select().from(choices).where(eq(choices.adventureId, id)),
  ])
  return { ...adventure, nodes: adventureNodes, choices: adventureChoices }
}

export async function getNode(nodeId: string) {
  const [node] = await db.select().from(nodes).where(eq(nodes.id, nodeId))
  return node ?? null
}

export async function getNodeChoices(nodeId: string) {
  return db.select().from(choices).where(eq(choices.sourceNodeId, nodeId)).orderBy(choices.orderIndex)
}

export async function getStartNode(adventureId: string) {
  const allNodes = await db.select().from(nodes).where(eq(nodes.adventureId, adventureId))
  return allNodes.find(n => n.nodeType === 'start') ?? allNodes[0] ?? null
}
