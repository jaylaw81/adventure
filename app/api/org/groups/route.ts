import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizationGroups } from '@/lib/schema'
import { eq } from 'drizzle-orm'

function sanitize(value: unknown, max = 200): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim().replace(/<[^>]*>/g, '').slice(0, max)
  return cleaned || null
}

export async function GET() {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  const groups = await db
    .select({
      id: organizationGroups.id,
      name: organizationGroups.name,
      description: organizationGroups.description,
      createdAt: organizationGroups.createdAt,
      privacyLevel: organizationGroups.privacyLevel,
    })
    .from(organizationGroups)
    .where(eq(organizationGroups.organizationId, ctx.org.id))
    .orderBy(organizationGroups.createdAt)

  return Response.json(groups)
}

export async function POST(req: Request) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { name, description } = body as Record<string, unknown>
  const cleanName = sanitize(name)
  if (!cleanName) return Response.json({ error: 'Group name is required' }, { status: 400 })

  const [group] = await db
    .insert(organizationGroups)
    .values({ organizationId: ctx.org.id, name: cleanName, description: sanitize(description, 500) })
    .returning()

  return Response.json(group, { status: 201 })
}
