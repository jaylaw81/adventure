import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyConfigs } from '@/lib/schema'
import { SURVEYS } from '@/lib/surveys'
import { eq } from 'drizzle-orm'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await params
  if (!slug || !/^[a-z0-9_-]+$/.test(slug)) {
    return Response.json({ error: 'Invalid slug — use lowercase letters, numbers, hyphens, underscores' }, { status: 400 })
  }

  const body = await req.json()
  const { title, intro, surveyKind, minDaysBetweenShows, dismissCooldownDays, questions } = body

  if (
    typeof title !== 'string' ||
    typeof intro !== 'string' ||
    !['quantitative', 'qualitative'].includes(surveyKind) ||
    typeof minDaysBetweenShows !== 'number' ||
    typeof dismissCooldownDays !== 'number' ||
    !Array.isArray(questions)
  ) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await db
    .insert(surveyConfigs)
    .values({ slug, title, intro, surveyKind, minDaysBetweenShows, dismissCooldownDays, questions })
    .onConflictDoUpdate({
      target: surveyConfigs.slug,
      set: { title, intro, surveyKind, minDaysBetweenShows, dismissCooldownDays, questions, updatedAt: new Date() },
    })

  return Response.json({ ok: true })
}

// Instant pause / resume — does not require a full save
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await params
  const { active } = await req.json()
  if (typeof active !== 'boolean') return Response.json({ error: 'active must be boolean' }, { status: 400 })

  // Update existing row if present
  const updated = await db
    .update(surveyConfigs)
    .set({ active, updatedAt: new Date() })
    .where(eq(surveyConfigs.slug, slug))
    .returning({ slug: surveyConfigs.slug })

  if (updated.length === 0) {
    // No DB row yet — create one from hardcoded defaults so active can be stored
    const hardcoded = SURVEYS.find(s => s.slug === slug)
    if (!hardcoded) return Response.json({ error: 'Unknown survey' }, { status: 404 })
    await db.insert(surveyConfigs).values({
      slug,
      title: hardcoded.title,
      intro: hardcoded.intro,
      surveyKind: hardcoded.surveyKind,
      minDaysBetweenShows: hardcoded.minDaysBetweenShows,
      dismissCooldownDays: hardcoded.dismissCooldownDays,
      questions: hardcoded.questions,
      active,
    })
  }

  return Response.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await params
  await db.delete(surveyConfigs).where(eq(surveyConfigs.slug, slug))
  return Response.json({ ok: true })
}
