import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from '../lib/schema'
import { generateSceneImage } from '../lib/generateImage'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
  console.log('Fetching completed scenes without images…')

  const allNodes = await db.select().from(schema.nodes)
  const pending = allNodes.filter(
    n => n.status === 'completed' && !n.imageUrl && (n.title || n.content).trim()
  )

  if (pending.length === 0) {
    console.log('Nothing to do — all completed scenes already have images.')
    return
  }

  console.log(`Found ${pending.length} scene(s) to process.\n`)

  for (let i = 0; i < pending.length; i++) {
    const node = pending[i]
    const label = node.title || `(node ${node.id.slice(0, 8)})`
    process.stdout.write(`[${i + 1}/${pending.length}] "${label}" … `)
    try {
      const imageUrl = await generateSceneImage(node.title, node.content)
      await db.update(schema.nodes).set({ imageUrl }).where(eq(schema.nodes.id, node.id))
      console.log('✓')
    } catch (e) {
      console.log(`✗ failed: ${(e as Error).message}`)
    }
  }

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
