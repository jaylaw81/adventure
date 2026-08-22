import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, nodes, choices } from '@/lib/schema'

export type ValidationIssue = {
  severity: 'error' | 'warning'
  code: string
  message: string
}

export type ValidationResult = {
  issues: ValidationIssue[]
  canPublish: boolean
}

function canReachEnding(
  nodeId: string,
  graph: Map<string, string[]>,
  endingIds: Set<string>,
  visited = new Set<string>(),
): boolean {
  if (visited.has(nodeId)) return false
  if (endingIds.has(nodeId)) return true
  visited.add(nodeId)
  return (graph.get(nodeId) ?? []).some(id => canReachEnding(id, graph, endingIds, new Set(visited)))
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [adventure] = await db.select().from(adventures).where(eq(adventures.id, id))
  if (!adventure || adventure.userEmail !== session.user.email)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [allNodes, allChoices] = await Promise.all([
    db.select().from(nodes).where(eq(nodes.adventureId, id)),
    db.select().from(choices).where(eq(choices.adventureId, id)),
  ])

  const issues: ValidationIssue[] = []

  if (allNodes.length === 0) {
    issues.push({ severity: 'error', code: 'no_scenes', message: 'Your story has no scenes. Add at least one before publishing.' })
    return NextResponse.json({ issues, canPublish: false } satisfies ValidationResult)
  }

  const startNode = allNodes.find(n => n.nodeType === 'start')

  if (!startNode) {
    issues.push({ severity: 'error', code: 'no_start', message: 'No start scene. Set one scene as "Start" so readers know where to begin.' })
  }

  // Storybook pages flow in order automatically — there's no choices graph to
  // validate, so skip straight to the ending check below.
  if (adventure.storyType === 'storybook') {
    const hasEnding = allNodes.some(n => n.nodeType === 'ending')
    if (!hasEnding) {
      issues.push({ severity: 'warning', code: 'no_endings', message: 'No page is marked "The End". The story will just stop after the last page.' })
    }
    const canPublish = !issues.some(i => i.severity === 'error')
    return NextResponse.json({ issues, canPublish } satisfies ValidationResult)
  }

  if (startNode) {
    const startChoices = allChoices.filter(c => c.sourceNodeId === startNode.id)
    if (startChoices.length === 0) {
      issues.push({ severity: 'error', code: 'start_no_choices', message: 'Your start scene has no choices. Readers need at least one path forward from the beginning.' })
    }
  }

  if (startNode) {
    const graph = new Map<string, string[]>()
    for (const node of allNodes) graph.set(node.id, [])
    for (const choice of allChoices) graph.get(choice.sourceNodeId)?.push(choice.targetNodeId)

    const endingIds = new Set(allNodes.filter(n => n.nodeType === 'ending').map(n => n.id))

    if (endingIds.size === 0) {
      issues.push({ severity: 'warning', code: 'no_endings', message: 'No ending scenes exist. Readers may reach a dead end with no conclusion.' })
    } else if (!canReachEnding(startNode.id, graph, endingIds)) {
      issues.push({ severity: 'warning', code: 'no_reachable_ending', message: 'None of your endings are reachable from the start. Readers will always hit a dead end.' })
    }
  }

  const brokenChapterEnds = allNodes.filter(n => n.nodeType === 'chapter_end' && !n.nextChapterId)
  if (brokenChapterEnds.length > 0) {
    const count = brokenChapterEnds.length
    issues.push({
      severity: 'warning',
      code: 'chapter_end_no_target',
      message: `${count} chapter transition${count > 1 ? 's have' : ' has'} no next chapter set. Readers will reach a dead end there.`,
    })
  }

  const canPublish = !issues.some(i => i.severity === 'error')

  return NextResponse.json({ issues, canPublish } satisfies ValidationResult)
}
