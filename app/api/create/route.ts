import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { v4 as uuidv4 } from 'uuid'

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

    const id = uuidv4().split('-')[0] // short id

    const mapping = {
      id,
      englishUrl,
      koreanUrl,
      createdAt: new Date().toISOString(),
    }

    await kv.set(`mapping:${id}`, mapping)

    const origin = req.nextUrl.origin

    return NextResponse.json(
      {
        id,
        link: `${origin}/${id}`,
        ...mapping,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create mapping' }, { status: 500 })
  }
}