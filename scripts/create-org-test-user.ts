/**
 * Creates the jason@storyquestor.com test user with organization tier.
 * Run with: npx tsx scripts/create-org-test-user.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import * as schema from '../lib/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const EMAIL = 'jason@storyquestor.com'
const PASSWORD = 'jasonlaw'
const DISPLAY_NAME = 'Jason'
const BIRTH_DATE = '1990-01-01'

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  const [existing] = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.email, EMAIL))
    .limit(1)

  if (existing) {
    await db
      .update(schema.users)
      .set({ passwordHash, displayName: DISPLAY_NAME, birthDate: BIRTH_DATE, tier: 'organization' })
      .where(eq(schema.users.email, EMAIL))
    console.log(`Updated existing user: ${EMAIL}`)
  } else {
    await db.insert(schema.users).values({
      email: EMAIL,
      displayName: DISPLAY_NAME,
      birthDate: BIRTH_DATE,
      passwordHash,
      tier: 'organization',
    })
    console.log(`Created new user: ${EMAIL}`)
  }

  console.log('Done. Credentials: jason@storyquestor.com / jasonlaw  |  tier: organization')
}

main().catch(e => { console.error(e); process.exit(1) })
