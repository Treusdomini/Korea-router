import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getCountry(request: NextRequest): string {
  // Vercel provides x-vercel-ip-country; Cloudflare provides cf-ipcountry.
  // Check both so the router works on either platform.
  return (
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    ''
  ).toUpperCase()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const mapping = await kv.get<{
    englishUrl: string
    koreanUrl: string
  }>(`mapping:${id}`)

  if (!mapping) {
    return new NextResponse('Link not found', { status: 404 })
  }

  const country = getCountry(request)
  const target = country === 'KR' ? mapping.koreanUrl : mapping.englishUrl

  // Preserve query string
  const url = new URL(request.url)
  const qs = url.searchParams.toString()
  const finalUrl = qs ? `${target}?${qs}` : target

  return NextResponse.redirect(finalUrl, 302)
}
