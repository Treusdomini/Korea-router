import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function GET() {
  try {
    // Use the index set instead of KEYS
    const ids = (await kv.smembers('mapping:ids')) as string[]

    if (!ids || ids.length === 0) {
      return NextResponse.json([])
    }

    const mappings = await Promise.all(
      ids.map(async (id) => {
        const data = await kv.get(`mapping:${id}`)
        return data
      })
    )

    // Filter out any nulls (in case a key was deleted without updating the set)
    return NextResponse.json(mappings.filter(Boolean))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to list mappings' }, { status: 500 })
  }
}
