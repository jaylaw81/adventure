import { NextResponse } from 'next/server'
import { getPricingConfig } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = await getPricingConfig()
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
