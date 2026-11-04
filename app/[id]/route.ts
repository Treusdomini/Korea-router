import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export const runtime = 'edge' // important for fast redirects

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // Simple bot filter
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  const isBot =
    ua.includes('bot') ||
    ua.includes('crawler') ||
    ua.includes('spider') ||
    ua.includes('preview') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('whatsapp') ||
    ua.includes('telegram')

  if (isBot) {
    return NextResponse.redirect('https://www.cloudflare.com', 302)
  }

  const mapping = await kv.get<{
    englishUrl: string
    koreanUrl: string
  }>(`mapping:${id}`)

  if (!mapping) {
    return new NextResponse('Link not found', { status: 404 })
  }

  // Vercel provides country for free
  const country = request.headers.get('x-vercel-ip-country') || ''
  const target = country === 'KR' ? mapping.koreanUrl : mapping.englishUrl

  // Preserve query string
  const url = new URL(request.url)
  const qs = url.searchParams.toString()
  const finalUrl = qs ? `${target}?${qs}` : target

  return NextResponse.redirect(finalUrl, 302)
}
