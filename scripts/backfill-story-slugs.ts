import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { and, eq, isNull } from 'drizzle-orm'
import * as schema from '../lib/schema'
import { generateUniqueSlug } from '../lib/ensureStorySlug'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
  const rows = await db
    .select({ id: schema.adventures.id, title: schema.adventures.title })
    .from(schema.adventures)
    .where(and(
      eq(schema.adventures.isPublic, true),
      eq(schema.adventures.status, 'active'),
      isNull(schema.adventures.storySlug),
    ))

  if (rows.length === 0) {
    console.log('Nothing to do — every public story already has a slug.')
    return
  }

  console.log(`Found ${rows.length} public story(s) without an SEO URL.\n`)

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    process.stdout.write(`[${i + 1}/${rows.length}] "${row.title}" … `)
    try {
      const slug = await generateUniqueSlug(row.title, row.id)
      await db.update(schema.adventures).set({ storySlug: slug }).where(eq(schema.adventures.id, row.id))
      console.log(`✓ /story/${slug}`)
    } catch (e) {
      console.log(`✗ failed: ${(e as Error).message}`)
    }
  }

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
