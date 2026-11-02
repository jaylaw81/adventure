import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGrowthInsights } from '@/lib/growthInsights'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    return NextResponse.json(await getGrowthInsights())
  } catch (err) {
    console.error('[insights/growth] route error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
