import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isGSCConfigured, getStorySearchQueries } from '@/lib/gsc-data'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!isGSCConfigured()) {
    return NextResponse.json({ configured: false })
  }

  const { id } = await params

  try {
    const queries = await getStorySearchQueries(id)
    return NextResponse.json({ configured: true, queries })
  } catch (err) {
    console.error('[gsc/story] route error:', err)
    return NextResponse.json({ configured: true, error: String(err) }, { status: 500 })
  }
}
