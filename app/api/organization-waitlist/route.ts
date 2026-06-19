import { db } from '@/lib/db'
import { organizationWaitlist } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { sendWaitlistNotification } from '@/lib/email'

const MAX = 200

function sanitize(value: unknown, max = MAX): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim().replace(/<[^>]*>/g, '').slice(0, max)
  return cleaned || null
}

const VALID_ROLES = ['teacher', 'administrator', 'librarian', 'other'] as const

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, name, school, role } = body as Record<string, unknown>

  const cleanEmail = sanitize(email, 254)
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return Response.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const cleanRole = typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role) ? role : null

  // Silently ignore duplicate emails
  const [existing] = await db
    .select({ id: organizationWaitlist.id })
    .from(organizationWaitlist)
    .where(eq(organizationWaitlist.email, cleanEmail))
    .limit(1)

  if (!existing) {
    const cleanName = sanitize(name)
    const cleanSchool = sanitize(school)
    await db.insert(organizationWaitlist).values({
      email: cleanEmail,
      name: cleanName,
      school: cleanSchool,
      role: cleanRole,
    })
    sendWaitlistNotification({
      email: cleanEmail,
      name: cleanName,
      school: cleanSchool,
      role: cleanRole,
    }).catch(console.error)
  }

  return Response.json({ ok: true })
}
