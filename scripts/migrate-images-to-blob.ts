import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, like } from 'drizzle-orm'
import * as schema from '../lib/schema'
import { uploadImageBuffer } from '../lib/blobStorage'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,([a-zA-Z0-9+/]+={0,2})$/

async function migrateOne(dataUrl: string, folder: string): Promise<string | null> {
  const match = DATA_URL_RE.exec(dataUrl)
  if (!match) return null
  const contentType = `image/${match[1]}`
  const buffer = Buffer.from(match[2], 'base64')
  return uploadImageBuffer(buffer, contentType, folder)
}

async function migrateTable<T extends { id: string }>(
  label: string,
  rows: (T & Record<string, unknown>)[],
  column: string,
  folder: string,
  update: (id: string, url: string) => Promise<unknown>
) {
  console.log(`\n${label}: ${rows.length} row(s) with embedded base64 images.`)
  let bytesSaved = 0
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const dataUrl = row[column] as string
    process.stdout.write(`[${i + 1}/${rows.length}] ${row.id} … `)
    try {
      const url = await migrateOne(dataUrl, folder)
      if (!url) { console.log('✗ not a valid data URL, skipped'); continue }
      bytesSaved += dataUrl.length
      await update(row.id, url)
      console.log('✓')
    } catch (e) {
      console.log(`✗ failed: ${(e as Error).message}`)
    }
  }
  console.log(`${label}: freed ~${(bytesSaved / 1024 / 1024).toFixed(1)}MB of inline HTML/DB payload.`)
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set. Enable Vercel Blob for this project and pull env vars first.')
    process.exit(1)
  }

  const coverRows = await db.select().from(schema.adventures).where(like(schema.adventures.coverImageUrl, 'data:image%'))
  await migrateTable('adventures.coverImageUrl', coverRows, 'coverImageUrl', 'covers', (id, url) =>
    db.update(schema.adventures).set({ coverImageUrl: url }).where(eq(schema.adventures.id, id))
  )

  const nodeRows = await db.select().from(schema.nodes).where(like(schema.nodes.imageUrl, 'data:image%'))
  await migrateTable('nodes.imageUrl', nodeRows, 'imageUrl', 'scenes', (id, url) =>
    db.update(schema.nodes).set({ imageUrl: url }).where(eq(schema.nodes.id, id))
  )

  const avatarRows = await db.select().from(schema.worldCharacters).where(like(schema.worldCharacters.avatarUrl, 'data:image%'))
  await migrateTable('worldCharacters.avatarUrl', avatarRows, 'avatarUrl', 'avatars', (id, url) =>
    db.update(schema.worldCharacters).set({ avatarUrl: url }).where(eq(schema.worldCharacters.id, id))
  )

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
