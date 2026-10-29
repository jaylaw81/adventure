// StoryQuestor → Twine 2 export.
//
// Produces a Twine 2 archive-style HTML file (a single <tw-storydata> element)
// that Twine imports via Library → Import. Passages are written in Harlowe
// syntax, Twine's default story format. Scene text is plain text, so it's
// emitted as-is; choices become [[label->Passage]] links.
//
// Not exported: World Builder stats/effects/conditions, items, foes, sounds.

import type { Adventure, Chapter, Node, Choice } from '@/lib/schema'

const HARLOWE_VERSION = '3.3.9'
// Our scene cards are larger than Twine's 100px passages, so shrink the layout.
const POSITION_SCALE = 1 / 2.5
const GRID_SPACING = 150
const GRID_COLUMNS = 8

// Names Twine story formats treat specially — a scene with one of these titles
// would run as setup code instead of showing up as a passage.
const RESERVED_NAMES = new Set([
  'StoryInit', 'StoryCaption', 'StoryMenu', 'StoryBanner', 'StorySubtitle', 'StoryAuthor',
  'StoryInterface', 'StoryShare', 'StoryTitle', 'StoryData', 'PassageReady', 'PassageDone',
  'PassageHeader', 'PassageFooter',
])

export type TwineExportInput = {
  adventure: Pick<Adventure, 'id' | 'title' | 'storyType' | 'editorMode'>
  chapters: Pick<Chapter, 'id' | 'title' | 'orderIndex'>[]
  nodes: Node[]
  choices: Choice[]
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Passage names can't contain link syntax, or [[label->Name]] would parse wrong. */
function sanitizeName(raw: string): string {
  const name = raw
    .replace(/->/g, '→')
    .replace(/<-/g, '←')
    .replace(/\|/g, '/')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/\s+/g, ' ')
    .trim()
  return name || 'Untitled Scene'
}

function sanitizeLabel(raw: string): string {
  return raw.replace(/\[/g, '(').replace(/\]/g, ')').replace(/\s+/g, ' ').trim() || 'Continue'
}

function toTag(title: string): string {
  return title.trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '')
}

export function buildTwineHtml({ adventure, chapters, nodes, choices }: TwineExportInput): string {
  const isStorybook = adventure.storyType === 'storybook'
  const chapterById = new Map(chapters.map(c => [c.id, c]))
  const chapterOrder = (n: Node) => (n.chapterId ? chapterById.get(n.chapterId)?.orderIndex ?? 0 : 0)

  // Same rule as getStartNode: the start node of the earliest chapter, else the first node.
  const startNodeId = isStorybook
    ? null
    : ([...nodes].filter(n => n.nodeType === 'start').sort((a, b) => chapterOrder(a) - chapterOrder(b))[0] ?? nodes[0])?.id ?? null

  // Order passages so pids follow reading order: start first, then by chapter and canvas position.
  const ordered = [...nodes].sort((a, b) => {
    if (isStorybook) return a.positionY - b.positionY || a.id.localeCompare(b.id)
    if (a.id === startNodeId) return -1
    if (b.id === startNodeId) return 1
    return chapterOrder(a) - chapterOrder(b) || a.positionY - b.positionY || a.positionX - b.positionX
  })

  // Unique passage names
  const nameById = new Map<string, string>()
  const used = new Set<string>()
  for (const n of ordered) {
    const base = sanitizeName(n.title)
    let name = RESERVED_NAMES.has(base) ? `${base} (scene)` : base
    for (let i = 2; used.has(name); i++) name = `${base} (${i})`
    used.add(name)
    nameById.set(n.id, name)
  }

  // Outgoing links per node, mirroring how the reader navigates.
  const choicesBySource = new Map<string, Choice[]>()
  for (const c of [...choices].sort((a, b) => a.orderIndex - b.orderIndex)) {
    if (!nameById.has(c.targetNodeId)) continue
    const list = choicesBySource.get(c.sourceNodeId) ?? []
    list.push(c)
    choicesBySource.set(c.sourceNodeId, list)
  }
  const chapterStartById = new Map<string, string>()
  for (const n of nodes) {
    if (n.nodeType === 'start' && n.chapterId && !chapterStartById.has(n.chapterId)) chapterStartById.set(n.chapterId, n.id)
  }

  function linksFor(n: Node, index: number): { label: string; target: string }[] {
    if (isStorybook) {
      const next = ordered[index + 1]
      return next ? [{ label: 'Next page', target: next.id }] : []
    }
    const own = (choicesBySource.get(n.id) ?? []).map(c => ({ label: c.label, target: c.targetNodeId }))
    if (n.nodeType !== 'chapter_end') return own

    const nextChapter = n.nextChapterId ? chapterById.get(n.nextChapterId) : undefined
    const label = nextChapter ? `Continue to ${nextChapter.title}` : 'Continue'
    if (n.chapterEntryNodeId && nameById.has(n.chapterEntryNodeId)) return [{ label, target: n.chapterEntryNodeId }]
    if (own.length > 0) return own
    const fallback = n.nextChapterId ? chapterStartById.get(n.nextChapterId) : undefined
    return fallback ? [{ label, target: fallback }] : []
  }

  // Layout: keep the Node Graph canvas arrangement. Block Builder and Storybook
  // positions only encode order (a single column), so lay those out in a grid.
  const distinctPositions = new Set(nodes.map(n => `${n.positionX},${n.positionY}`)).size
  const useCanvasLayout = !isStorybook && adventure.editorMode !== 'block' && distinctPositions > 1
  const minX = Math.min(...nodes.map(n => n.positionX))
  const minY = Math.min(...nodes.map(n => n.positionY))

  const passages = ordered.map((n, i) => {
    const x = useCanvasLayout ? Math.round((n.positionX - minX) * POSITION_SCALE) + 100 : 100 + (i % GRID_COLUMNS) * GRID_SPACING
    const y = useCanvasLayout ? Math.round((n.positionY - minY) * POSITION_SCALE) + 100 : 100 + Math.floor(i / GRID_COLUMNS) * GRID_SPACING

    const parts: string[] = []
    if (n.imageUrl && /^https?:\/\//.test(n.imageUrl)) parts.push(`<img src="${n.imageUrl.replace(/"/g, '%22')}" alt="">`)
    if (n.content.trim()) parts.push(n.content.trim())
    const links = linksFor(n, i).map(l => `[[${sanitizeLabel(l.label)}->${nameById.get(l.target)}]]`)
    if (links.length) parts.push(links.join('\n'))

    const chapter = n.chapterId ? chapterById.get(n.chapterId) : undefined
    const tags = chapter ? toTag(chapter.title) : ''

    return `<tw-passagedata pid="${i + 1}" name="${escapeHtml(nameById.get(n.id)!)}" tags="${escapeHtml(tags)}" position="${x},${y}" size="100,100">${escapeHtml(parts.join('\n\n'))}</tw-passagedata>`
  })

  const startIndex = ordered.findIndex(n => n.id === startNodeId)
  const startPid = startIndex === -1 ? 1 : startIndex + 1
  // Twine identifies stories by IFID; reusing the adventure id means re-importing
  // a fresh export offers to replace the earlier copy instead of duplicating it.
  const ifid = adventure.id.toUpperCase()

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(adventure.title)}</title></head>
<body>
<!-- Exported from StoryQuestor. Import into Twine 2 via Library → Import. -->
<tw-storydata name="${escapeHtml(adventure.title)}" startnode="${startPid}" creator="StoryQuestor" creator-version="1.0" ifid="${ifid}" zoom="1" format="Harlowe" format-version="${HARLOWE_VERSION}" options="" hidden><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style><script role="script" id="twine-user-script" type="text/twine-javascript"></script>
${passages.join('\n')}
</tw-storydata>
</body>
</html>
`
}
