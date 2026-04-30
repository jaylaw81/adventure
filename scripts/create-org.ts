/**
 * Creates the StoryQuestor Test School org for jason@storyquestor.com.
 * Run with: npx tsx scripts/create-org.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from '../lib/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const ADMIN_EMAIL = 'jason@storyquestor.com'
const ORG_NAME = 'StoryQuestor Test School'

async function main() {
  const [existing] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.adminEmail, ADMIN_EMAIL))
    .limit(1)

  let orgId: string

  if (existing) {
    orgId = existing.id
    console.log(`Organization already exists: "${existing.name}" (${orgId})`)
  } else {
    const [org] = await db
      .insert(schema.organizations)
      .values({ name: ORG_NAME, adminEmail: ADMIN_EMAIL, description: 'Test organization for the StoryQuestor Organization tier.' })
      .returning()
    orgId = org.id
    console.log(`Created organization: "${ORG_NAME}" (${orgId})`)
  }

  // Ensure admin is in the members table with role 'admin'
  const [existingMember] = await db
    .select()
    .from(schema.organizationMembers)
    .where(eq(schema.organizationMembers.userEmail, ADMIN_EMAIL))
    .limit(1)

  if (!existingMember) {
    await db.insert(schema.organizationMembers).values({
      organizationId: orgId,
      userEmail: ADMIN_EMAIL,
      role: 'admin',
    })
    console.log(`Added ${ADMIN_EMAIL} as org admin member.`)
  } else {
    console.log(`${ADMIN_EMAIL} is already a member.`)
  }

  console.log('Done.')
}

main().catch(e => { console.error(e); process.exit(1) })
