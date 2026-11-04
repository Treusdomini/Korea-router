import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

// BUG FIX: Next.js 14 caches GET route handlers at build time by default.
// Without this, /api/list was prerendered with an empty index and every
// dashboard request received the stale (empty) snapshot — new links were
// created but never showed up.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use the index set instead of KEYS
    const ids = (await kv.smembers('mapping:ids')) as string[]

    if (!ids || ids.length === 0) {
      return NextResponse.json([])
    }

    const mappings = await Promise.all(
      ids.map(async (id) => {
        const data = await kv.get<{
          id: string
          englishUrl: string
          koreanUrl: string
          createdAt: string
        }>(`mapping:${id}`)
        return data
      })
    )

    // Filter out any nulls (in case a key was deleted without updating the set)
    // and show newest first.
    const list = mappings
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return NextResponse.json(list)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to list mappings' }, { status: 500 })
  }
}
