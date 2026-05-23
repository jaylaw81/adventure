import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isNull, eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, chapters, nodes, choices } from '@/lib/schema'
import { getAdventures } from '@/lib/queries'

const ORIGINAL_OWNER = 'jaylaw81@gmail.com'

// ── Template definitions ────────────────────────────────────────────────────

type NodeDef = {
  key: string
  title: string
  content: string
  nodeType: 'start' | 'scene' | 'ending'
  positionX: number
  positionY: number
  phase: number // used for chapter assignment
}

type ChoiceDef = {
  from: string
  to: string
  label: string
  order: number
}

type TemplateDef = { nodes: NodeDef[]; choices: ChoiceDef[]; maxPhase: number }

const TEMPLATES: Record<string, TemplateDef> = {
  small: {
    maxPhase: 2,
    nodes: [
      { key: 'start', title: 'The Beginning', content: 'Your story starts here. Set the scene and introduce the world your reader is about to step into.', nodeType: 'start', positionX: 350, positionY: 80, phase: 0 },
      { key: 'sceneA', title: 'A Fork in the Road', content: 'Describe what the reader encounters on this path. What challenges or discoveries await them?', nodeType: 'scene', positionX: 150, positionY: 280, phase: 1 },
      { key: 'sceneB', title: 'An Unexpected Turn', content: 'This path takes a different direction. Paint the atmosphere and what makes this route unique.', nodeType: 'scene', positionX: 550, positionY: 280, phase: 1 },
      { key: 'endA', title: 'A Bright Conclusion', content: 'Bring this storyline to a satisfying close. What did the reader earn or discover by coming this way?', nodeType: 'ending', positionX: 150, positionY: 480, phase: 2 },
      { key: 'endB', title: 'A Bittersweet End', content: 'Every path has consequences. Show the reader what their choices ultimately led to.', nodeType: 'ending', positionX: 550, positionY: 480, phase: 2 },
    ],
    choices: [
      { from: 'start', to: 'sceneA', label: 'Take the safer path', order: 0 },
      { from: 'start', to: 'sceneB', label: 'Risk the unknown', order: 1 },
      { from: 'sceneA', to: 'endA', label: 'Embrace what you\'ve found', order: 0 },
      { from: 'sceneB', to: 'endB', label: 'Accept what became of you', order: 0 },
    ],
  },

  medium: {
    maxPhase: 3,
    nodes: [
      { key: 'start', title: 'The Opening', content: 'Introduce the world and the central conflict. Give the reader a reason to care about what happens next.', nodeType: 'start', positionX: 550, positionY: 60, phase: 0 },
      { key: 's1', title: 'The First Crossroads', content: 'The reader faces an early decision. Describe the environment and what each direction promises or threatens.', nodeType: 'scene', positionX: 270, positionY: 240, phase: 1 },
      { key: 's2', title: 'A Deeper Mystery', content: 'Something unexpected complicates the journey. Raise the stakes and deepen the world.', nodeType: 'scene', positionX: 830, positionY: 240, phase: 1 },
      { key: 's3', title: 'Light at the End', content: 'A sign of hope or resolution begins to appear. The reader is close to one kind of outcome.', nodeType: 'scene', positionX: 150, positionY: 440, phase: 2 },
      { key: 'e1', title: 'The Shortcut\'s Price', content: 'Some paths end quickly — not always with what was hoped for. Describe what cutting corners cost.', nodeType: 'ending', positionX: 390, positionY: 440, phase: 2 },
      { key: 's4', title: 'Into the Unknown', content: 'The reader ventures deeper. The world becomes stranger, the tension higher.', nodeType: 'scene', positionX: 710, positionY: 440, phase: 2 },
      { key: 'e2', title: 'A Surprising Twist', content: 'What seemed like one thing turns out to be another. End with a revelation that reframes the journey.', nodeType: 'ending', positionX: 950, positionY: 440, phase: 2 },
      { key: 'e3', title: 'Hard-Earned Peace', content: 'The reader who stayed the course finds a resolution worth the struggle. Describe what they\'ve won.', nodeType: 'ending', positionX: 150, positionY: 640, phase: 3 },
      { key: 'e4', title: 'Unexpected Victory', content: 'The most daring path yields the most surprising reward. What does the reader discover at the end?', nodeType: 'ending', positionX: 710, positionY: 640, phase: 3 },
    ],
    choices: [
      { from: 'start', to: 's1', label: 'Follow the familiar road', order: 0 },
      { from: 'start', to: 's2', label: 'Explore the mystery', order: 1 },
      { from: 's1', to: 's3', label: 'Stay the course', order: 0 },
      { from: 's1', to: 'e1', label: 'Take a shortcut', order: 1 },
      { from: 's2', to: 's4', label: 'Venture further', order: 0 },
      { from: 's2', to: 'e2', label: 'Uncover the truth', order: 1 },
      { from: 's3', to: 'e3', label: 'Find your peace', order: 0 },
      { from: 's4', to: 'e4', label: 'Claim your victory', order: 0 },
    ],
  },

  large: {
    maxPhase: 3,
    nodes: [
      { key: 'start', title: 'The Call to Adventure', content: 'Something extraordinary pulls the reader into action. Establish the world, the stakes, and the three directions the story can go.', nodeType: 'start', positionX: 850, positionY: 60, phase: 0 },
      { key: 's1', title: 'The Road Less Traveled', content: 'A quieter, more cautious path. Describe what the reader finds when they choose patience over boldness.', nodeType: 'scene', positionX: 300, positionY: 260, phase: 1 },
      { key: 's2', title: 'Heart of the Storm', content: 'The most dangerous and direct route. High risk, high reward — paint the chaos and the opportunity within it.', nodeType: 'scene', positionX: 850, positionY: 260, phase: 1 },
      { key: 's3', title: 'The Final Gambit', content: 'A calculated but desperate move. The reader bets everything on one plan. Show the preparation and the doubt.', nodeType: 'scene', positionX: 1400, positionY: 260, phase: 1 },
      { key: 's4', title: 'Whispers in the Dark', content: 'Something hidden reveals itself to the careful observer. Describe the secrets that patience uncovers.', nodeType: 'scene', positionX: 100, positionY: 460, phase: 2 },
      { key: 's5', title: 'A Fleeting Hope', content: 'A moment of clarity or opportunity appears briefly. The reader must decide whether to seize it.', nodeType: 'scene', positionX: 500, positionY: 460, phase: 2 },
      { key: 's6', title: 'The Eye of the Storm', content: 'A sudden stillness in the chaos — a moment to breathe, reassess, and choose the final move.', nodeType: 'scene', positionX: 650, positionY: 460, phase: 2 },
      { key: 's7', title: 'Shadows and Lies', content: 'Not everything in the storm is what it seems. Betrayal or misdirection complicates the path forward.', nodeType: 'scene', positionX: 1050, positionY: 460, phase: 2 },
      { key: 's8', title: 'The Long Road Home', content: 'The gambit requires patience to pay off. Describe the waiting, the doubt, and the slow unraveling of the plan.', nodeType: 'scene', positionX: 1200, positionY: 460, phase: 2 },
      { key: 's9', title: 'One Last Stand', content: 'Everything comes down to this moment. The reader commits fully — describe the confrontation or climax.', nodeType: 'scene', positionX: 1600, positionY: 460, phase: 2 },
      { key: 'e1', title: 'Quiet Victory', content: 'The patient path leads to a subtle but lasting triumph. What did the reader preserve by choosing caution?', nodeType: 'ending', positionX: 100, positionY: 660, phase: 3 },
      { key: 'e2', title: 'A Pyrrhic Win', content: 'Success came, but at a price. Describe what was gained and what was permanently lost along the way.', nodeType: 'ending', positionX: 500, positionY: 660, phase: 3 },
      { key: 'e3', title: 'Stalemate', content: 'The storm could not be won — only survived. The reader emerges changed but without a clear victory.', nodeType: 'ending', positionX: 650, positionY: 660, phase: 3 },
      { key: 'e4', title: 'A New Beginning', content: 'The lies are exposed and the shadows lift. The reader has earned a fresh start in a changed world.', nodeType: 'ending', positionX: 1050, positionY: 660, phase: 3 },
      { key: 'e5', title: 'The Price of Truth', content: 'The plan worked, but the cost was steep. What did the reader sacrifice to see their gambit through?', nodeType: 'ending', positionX: 1200, positionY: 660, phase: 3 },
      { key: 'e6', title: 'Legend\'s End', content: 'The last stand becomes the stuff of legend. Describe the final moment and what it meant for the world.', nodeType: 'ending', positionX: 1600, positionY: 660, phase: 3 },
    ],
    choices: [
      { from: 'start', to: 's1', label: 'Take the road less traveled', order: 0 },
      { from: 'start', to: 's2', label: 'Walk into the storm', order: 1 },
      { from: 'start', to: 's3', label: 'Play the final gambit', order: 2 },
      { from: 's1', to: 's4', label: 'Listen to the whispers', order: 0 },
      { from: 's1', to: 's5', label: 'Hold on to hope', order: 1 },
      { from: 's2', to: 's6', label: 'Navigate the eye', order: 0 },
      { from: 's2', to: 's7', label: 'Chase the shadows', order: 1 },
      { from: 's3', to: 's8', label: 'Begin the long road home', order: 0 },
      { from: 's3', to: 's9', label: 'Make one last stand', order: 1 },
      { from: 's4', to: 'e1', label: 'Claim a quiet victory', order: 0 },
      { from: 's5', to: 'e2', label: 'Accept the cost', order: 0 },
      { from: 's6', to: 'e3', label: 'Reach a stalemate', order: 0 },
      { from: 's7', to: 'e4', label: 'Begin anew', order: 0 },
      { from: 's8', to: 'e5', label: 'Uncover the truth', order: 0 },
      { from: 's9', to: 'e6', label: 'Become a legend', order: 0 },
    ],
  },
}

// Maps a phase (0..maxPhase) to a 0-based chapter index
function phaseToChapterIndex(phase: number, maxPhase: number, chapterCount: number): number {
  if (chapterCount <= 1) return 0
  const ratio = phase / maxPhase
  return Math.min(Math.floor(ratio * chapterCount), chapterCount - 1)
}

// ── Route handlers ──────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const email = session.user.email

    if (email === ORIGINAL_OWNER) {
      await db
        .update(adventures)
        .set({ userEmail: ORIGINAL_OWNER })
        .where(isNull(adventures.userEmail))
    }

    const all = await getAdventures(email)
    return NextResponse.json(all)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch adventures' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, template, chapterCount = 0 } = body as {
      title: string
      description?: string
      template?: 'small' | 'medium' | 'large'
      chapterCount?: number
    }

    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    // Create the adventure
    const [adventure] = await db
      .insert(adventures)
      .values({ title, description: description ?? '', userEmail: session.user.email })
      .returning()

    const tpl = template ? TEMPLATES[template] : null

    if (!tpl) {
      // Blank story: one chapter + one start node (original behaviour)
      const [chapter1] = await db
        .insert(chapters)
        .values({ adventureId: adventure.id, title: 'Chapter 1', orderIndex: 0 })
        .returning()
      await db.insert(nodes).values({
        adventureId: adventure.id,
        chapterId: chapter1.id,
        title: 'Chapter Start',
        content: '',
        nodeType: 'start',
        positionX: 100,
        positionY: 100,
      })
      return NextResponse.json(adventure, { status: 201 })
    }

    // Template: create chapters (if requested), then nodes, then choices
    const resolvedChapterCount = Math.max(0, chapterCount)

    // Build chapter records
    const chapterRecords: { id: string; orderIndex: number }[] = []
    if (resolvedChapterCount >= 1) {
      const chapterNames = resolvedChapterCount <= 3
        ? ['Chapter 1', 'Chapter 2', 'Chapter 3'].slice(0, resolvedChapterCount)
        : Array.from({ length: resolvedChapterCount }, (_, i) => `Chapter ${i + 1}`)

      const inserted = await db
        .insert(chapters)
        .values(chapterNames.map((chTitle, i) => ({
          adventureId: adventure.id,
          title: chTitle,
          orderIndex: i,
        })))
        .returning()
      chapterRecords.push(...inserted.map(c => ({ id: c.id, orderIndex: c.orderIndex })))
    }

    // Insert nodes and build key→id map
    const keyToId = new Map<string, string>()
    for (const nodeDef of tpl.nodes) {
      let chapterId: string | null = null
      if (chapterRecords.length > 0) {
        const idx = phaseToChapterIndex(nodeDef.phase, tpl.maxPhase, chapterRecords.length)
        chapterId = chapterRecords[idx]?.id ?? null
      }
      const [inserted] = await db
        .insert(nodes)
        .values({
          adventureId: adventure.id,
          chapterId,
          title: nodeDef.title,
          content: nodeDef.content,
          nodeType: nodeDef.nodeType,
          positionX: nodeDef.positionX,
          positionY: nodeDef.positionY,
        })
        .returning()
      keyToId.set(nodeDef.key, inserted.id)
    }

    // Insert choices
    const choiceValues = tpl.choices
      .filter(c => keyToId.has(c.from) && keyToId.has(c.to))
      .map(c => ({
        adventureId: adventure.id,
        sourceNodeId: keyToId.get(c.from)!,
        targetNodeId: keyToId.get(c.to)!,
        label: c.label,
        orderIndex: c.order,
      }))

    if (choiceValues.length > 0) {
      await db.insert(choices).values(choiceValues)
    }

    return NextResponse.json(adventure, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create adventure' }, { status: 500 })
  }
}
