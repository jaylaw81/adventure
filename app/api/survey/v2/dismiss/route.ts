import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveyImpressionsV2 } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return Response.json({ ok: true }) }

  const { impressionId } = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>
  if (typeof impressionId !== 'string') return Response.json({ ok: true })

  await db
    .update(surveyImpressionsV2)
    .set({ dismissedAt: new Date() })
    .where(eq(surveyImpressionsV2.id, impressionId))

  return Response.json({ ok: true })
}
