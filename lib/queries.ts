import { eq, sql, and, inArray, isNotNull, desc } from 'drizzle-orm'
import { db } from './db'
import { adventures, nodes, choices, chapters, storyReviews } from './schema'

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

  // Fetch only nodes and choices belonging to this user's adventures
  const adventureIds = allAdventures.map(a => a.id)
  const [allNodes, allChoices] = await Promise.all([
    db.select({ id: nodes.id, adventureId: nodes.adventureId, nodeType: nodes.nodeType })
      .from(nodes)
      .where(inArray(nodes.adventureId, adventureIds)),
    db.select({ adventureId: choices.adventureId, sourceNodeId: choices.sourceNodeId, targetNodeId: choices.targetNodeId })
      .from(choices)
      .where(inArray(choices.adventureId, adventureIds)),
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

export async function getPublicAdventures() {
  return db
    .select({
      id: adventures.id,
      title: adventures.title,
      description: adventures.description,
      audience: adventures.audience,
      tags: adventures.tags,
      shareToken: adventures.shareToken,
      createdAt: adventures.createdAt,
      updatedAt: adventures.updatedAt,
    })
    .from(adventures)
    .where(and(eq(adventures.isPublic, true), eq(adventures.status, 'active')))
    .orderBy(desc(adventures.updatedAt))
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
  const [adventureNodes, adventureChoices, adventureChapters] = await Promise.all([
    db.select().from(nodes).where(eq(nodes.adventureId, id)),
    db.select().from(choices).where(eq(choices.adventureId, id)),
    db.select().from(chapters).where(eq(chapters.adventureId, id)).orderBy(chapters.orderIndex),
  ])
  return { ...adventure, nodes: adventureNodes, choices: adventureChoices, chapters: adventureChapters }
}

export async function getNode(nodeId: string) {
  const [node] = await db.select().from(nodes).where(eq(nodes.id, nodeId))
  return node ?? null
}

export async function getNodeChoices(nodeId: string) {
  return db.select().from(choices).where(eq(choices.sourceNodeId, nodeId)).orderBy(choices.orderIndex)
}

export async function getChapterStartNode(adventureId: string, chapterId: string) {
  const [startNode] = await db
    .select()
    .from(nodes)
    .where(and(eq(nodes.adventureId, adventureId), eq(nodes.chapterId, chapterId), eq(nodes.nodeType, 'start')))
    .limit(1)
  return startNode ?? null
}

export async function getChapter(chapterId: string) {
  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId))
  return chapter ?? null
}

export async function getStartNode(adventureId: string) {
  // Join with chapters so that when multiple start nodes exist (one per chapter),
  // we return the one belonging to the chapter with the lowest orderIndex.
  const [startNode] = await db
    .select({ node: nodes })
    .from(nodes)
    .leftJoin(chapters, eq(nodes.chapterId, chapters.id))
    .where(and(eq(nodes.adventureId, adventureId), eq(nodes.nodeType, 'start')))
    .orderBy(sql`coalesce(${chapters.orderIndex}, 0)`)
    .limit(1)
  if (startNode) return startNode.node
  // Fallback: return the first node for adventures without an explicit start node
  const [first] = await db
    .select()
    .from(nodes)
    .where(eq(nodes.adventureId, adventureId))
    .limit(1)
  return first ?? null
}

export async function getAllPublicTags(): Promise<string[]> {
  const rows = await db
    .select({ tags: adventures.tags })
    .from(adventures)
    .where(and(eq(adventures.isPublic, true), eq(adventures.status, 'active')))

  const tagSet = new Set<string>()
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.tags ?? '[]')
      if (Array.isArray(parsed)) {
        for (const t of parsed) {
          if (typeof t === 'string' && t.trim()) tagSet.add(t.trim())
        }
      }
    } catch { /* ignore */ }
  }
  return [...tagSet].sort()
}

export async function getPublicAdventuresByTag(tag: string) {
  const tagFilter = sql`${adventures.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`

  const [stories, ratingRows] = await Promise.all([
    db
      .select({
        id: adventures.id,
        title: adventures.title,
        description: adventures.description,
        audience: adventures.audience,
        tags: adventures.tags,
        shareToken: adventures.shareToken,
        updatedAt: adventures.updatedAt,
        createdAt: adventures.createdAt,
      })
      .from(adventures)
      .where(and(eq(adventures.isPublic, true), eq(adventures.status, 'active'), tagFilter))
      .orderBy(desc(adventures.updatedAt)),
    db
      .select({
        adventureId: storyReviews.adventureId,
        avgRating: sql<number>`round(avg(${storyReviews.rating})::numeric, 1)::float`,
        reviewCount: sql<number>`count(*)::int`,
      })
      .from(storyReviews)
      .where(eq(storyReviews.hidden, false))
      .groupBy(storyReviews.adventureId),
  ])

  const ratingMap = new Map(ratingRows.map(r => [r.adventureId, r]))
  const adventureIds = stories.map(s => s.id)

  const startNodeImages = adventureIds.length > 0
    ? await db
        .select({ adventureId: nodes.adventureId, imageUrl: nodes.imageUrl })
        .from(nodes)
        .where(and(
          inArray(nodes.adventureId, adventureIds),
          eq(nodes.nodeType, 'start'),
          isNotNull(nodes.imageUrl),
        ))
    : []

  const coverMap = new Map<string, string>()
  for (const row of startNodeImages) {
    if (!coverMap.has(row.adventureId) && row.imageUrl) {
      coverMap.set(row.adventureId, row.imageUrl)
    }
  }

  return stories.map(s => ({
    ...s,
    avgRating: ratingMap.get(s.id)?.avgRating ?? null,
    reviewCount: ratingMap.get(s.id)?.reviewCount ?? 0,
    coverImageUrl: coverMap.get(s.id) ?? null,
  }))
}
