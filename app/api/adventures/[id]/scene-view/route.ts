import { NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { storySceneStats } from '@/lib/schema'
import { isBotUserAgent } from '@/lib/isBot'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Anonymous reader journey counters: one view per scene, plus a "continue" on the scene the reader left.
// Sent with sendBeacon, so always answers 204 and never surfaces an error to the reader.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const done = new NextResponse(null, { status: 204 })
  if (isBotUserAgent(req.headers.get('user-agent'))) return done

  try {
    const { id } = await params
    const { nodeId, fromNodeId } = JSON.parse(await req.text()) as { nodeId?: string; fromNodeId?: string | null }
    if (!UUID.test(id) || !nodeId || !UUID.test(nodeId)) return done

    // Selecting from nodes means a scene from another story (or a made-up ID) inserts nothing
    await db.execute(sql`
      insert into story_scene_stats (node_id, adventure_id, views)
      select id, adventure_id, 1 from nodes where id = ${nodeId} and adventure_id = ${id}
      on conflict (node_id) do update set views = story_scene_stats.views + 1
    `)

    if (fromNodeId && UUID.test(fromNodeId) && fromNodeId !== nodeId) {
      await db.update(storySceneStats)
        .set({ continues: sql`${storySceneStats.continues} + 1` })
        .where(and(eq(storySceneStats.nodeId, fromNodeId), eq(storySceneStats.adventureId, id)))
    }
  } catch (err) {
    console.error('Scene view failed:', err)
  }
  return done
}
