import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyConfigs } from '@/lib/schema'
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
