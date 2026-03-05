import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eq, inArray } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, nodes } from '@/lib/schema'
import type { Adventure } from '@/lib/schema'
import { generateSceneImage } from '@/lib/generateImage'

export const maxDuration = 60

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userAdventures = await db
      .select({ id: adventures.id, audience: adventures.audience })
      .from(adventures)
      .where(eq(adventures.userEmail, session.user.email))

    if (userAdventures.length === 0) return NextResponse.json({ processed: 0 })

    const adventureIds = userAdventures.map(a => a.id)

    const allNodes = await db
      .select()
      .from(nodes)
      .where(inArray(nodes.adventureId, adventureIds))

    const pending = allNodes.filter(
      n => n.status === 'completed' && !n.imageUrl && (n.title || n.content).trim()
    )

    const audienceMap = new Map(userAdventures.map(a => [a.id, a.audience]))

    // Process sequentially to avoid overwhelming the HF API
    let processed = 0
    for (const node of pending) {
      try {
        const audience = audienceMap.get(node.adventureId) ?? 'all'
        const imageUrl = await generateSceneImage(node.title, node.content, audience)
        await db.update(nodes).set({ imageUrl }).where(eq(nodes.id, node.id))
        processed++
      } catch (e) {
        console.error(`Failed to generate image for node ${node.id}:`, e)
      }
    }

    return NextResponse.json({ processed })
  } catch (e) {
    return NextResponse.json({ error: 'Batch generation failed' }, { status: 500 })
  }
}
