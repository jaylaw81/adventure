import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { HfInference } from '@huggingface/inference'
import * as schema from '../lib/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY!)

async function generateSceneImage(title: string, content: string): Promise<string> {
  const text = `${title} ${content}`.trim().slice(0, 200)
  const prompt = `cinematic storybook illustration, vivid colors, highly detailed: ${text}`
  const result = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    inputs: prompt,
    parameters: { width: 1024, height: 576 },
  })
  const arrayBuf = await (result as unknown as Blob).arrayBuffer()
  const buffer = Buffer.from(arrayBuf)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

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
