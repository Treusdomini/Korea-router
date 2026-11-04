import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { englishUrl, koreanUrl } = body

    if (!englishUrl || !koreanUrl) {
      return NextResponse.json(
        { error: 'englishUrl and koreanUrl are required' },
        { status: 400 }
      )
    }

    if (!isValidUrl(englishUrl) || !isValidUrl(koreanUrl)) {
      return NextResponse.json(
        { error: 'Both URLs must be valid http(s) URLs' },
        { status: 400 }
      )
    }

    const id = uuidv4().split('-')[0] // short id

    const mapping = {
      id,
      englishUrl,
      koreanUrl,
      createdAt: new Date().toISOString(),
    }

    // Store the mapping
    await kv.set(`mapping:${id}`, mapping)

    // Keep an index of all IDs (this is what the list endpoint will use)
    await kv.sadd('mapping:ids', id)

    // Prefer APP_DOMAIN, fall back to request origin
    const domain = process.env.APP_DOMAIN
      ? `https://${process.env.APP_DOMAIN}`
      : req.nextUrl.origin

    return NextResponse.json(
      {
        ...mapping,
        link: `${domain}/${id}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create mapping' }, { status: 500 })
  }
}
