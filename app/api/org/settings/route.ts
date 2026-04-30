import { getOrgAdminContext, unauthorized } from '@/lib/orgAuth'
import { db } from '@/lib/db'
import { organizations } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const MAX = 500
const VALID_PRIVACY = ['public', 'org-only', 'private'] as const

function sanitize(value: unknown, max = MAX): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim().replace(/<[^>]*>/g, '').slice(0, max)
  return cleaned || null
}

export async function PUT(req: Request) {
  const ctx = await getOrgAdminContext()
  if (!ctx) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }

  const { name, description, privacyLevel } = body as Record<string, unknown>

  const cleanName = sanitize(name, 200)
  if (!cleanName) return Response.json({ error: 'Organization name is required' }, { status: 400 })

  if (privacyLevel !== undefined && !(VALID_PRIVACY as readonly string[]).includes(privacyLevel as string)) {
    return Response.json({ error: 'Invalid privacy level' }, { status: 400 })
  }

  const [updated] = await db
    .update(organizations)
    .set({
      name: cleanName,
      description: sanitize(description),
      ...(privacyLevel !== undefined && { privacyLevel: privacyLevel as string }),
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, ctx.org.id))
    .returning()

  return Response.json({ org: updated })
}
