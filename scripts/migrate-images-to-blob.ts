import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, like } from 'drizzle-orm'
import * as schema from '../lib/schema'
import { uploadImageBuffer } from '../lib/blobStorage'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// Neon's HTTP driver caps a single query response at 64MB. Base64 image columns can be
// several MB each, so we pull rows in small batches instead of selecting the whole table.
const BATCH_SIZE = 5

const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,([a-zA-Z0-9+/]+={0,2})$/

async function migrateOne(dataUrl: string, folder: string): Promise<string | null> {
  const match = DATA_URL_RE.exec(dataUrl)
  if (!match) return null
  const contentType = `image/${match[1]}`
  const buffer = Buffer.from(match[2], 'base64')
  return uploadImageBuffer(buffer, contentType, folder)
}

async function migrateColumn(
  label: string,
  folder: string,
  fetchBatch: () => Promise<{ id: string; dataUrl: string | null }[]>,
  update: (id: string, url: string) => Promise<unknown>
) {
  console.log(`\n${label}:`)
  let total = 0
  let bytesSaved = 0

  // Each successfully migrated row stops matching the WHERE filter, so re-querying the
  // same batch naturally advances through the table without needing offsets.
  while (true) {
    const rows = await fetchBatch()
    if (rows.length === 0) break

    for (const row of rows) {
      total++
      process.stdout.write(`[${total}] ${row.id} … `)
      if (!row.dataUrl) { console.log('✗ empty, skipped'); continue }
      try {
        const url = await migrateOne(row.dataUrl, folder)
        if (!url) { console.log('✗ not a valid data URL, skipped'); continue }
        bytesSaved += row.dataUrl.length
        await update(row.id, url)
        console.log('✓')
      } catch (e) {
        console.log(`✗ failed: ${(e as Error).message}`)
      }
    }
  }

  console.log(total === 0
    ? `${label}: nothing to migrate.`
    : `${label}: migrated ${total} row(s), freed ~${(bytesSaved / 1024 / 1024).toFixed(1)}MB of inline HTML/DB payload.`)
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set. Enable Vercel Blob for this project and pull env vars first.')
    process.exit(1)
  }

  await migrateColumn(
    'adventures.coverImageUrl',
    'covers',
    async () => {
      const rows = await db
        .select({ id: schema.adventures.id, dataUrl: schema.adventures.coverImageUrl })
        .from(schema.adventures)
        .where(like(schema.adventures.coverImageUrl, 'data:image%'))
        .limit(BATCH_SIZE)
      return rows
    },
    (id, url) => db.update(schema.adventures).set({ coverImageUrl: url }).where(eq(schema.adventures.id, id))
  )

  await migrateColumn(
    'nodes.imageUrl',
    'scenes',
    async () => {
      const rows = await db
        .select({ id: schema.nodes.id, dataUrl: schema.nodes.imageUrl })
        .from(schema.nodes)
        .where(like(schema.nodes.imageUrl, 'data:image%'))
        .limit(BATCH_SIZE)
      return rows
    },
    (id, url) => db.update(schema.nodes).set({ imageUrl: url }).where(eq(schema.nodes.id, id))
  )

  await migrateColumn(
    'worldCharacters.avatarUrl',
    'avatars',
    async () => {
      const rows = await db
        .select({ id: schema.worldCharacters.id, dataUrl: schema.worldCharacters.avatarUrl })
        .from(schema.worldCharacters)
        .where(like(schema.worldCharacters.avatarUrl, 'data:image%'))
        .limit(BATCH_SIZE)
      return rows
    },
    (id, url) => db.update(schema.worldCharacters).set({ avatarUrl: url }).where(eq(schema.worldCharacters.id, id))
  )

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
