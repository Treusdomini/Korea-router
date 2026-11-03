import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function GET() {
  try {
    const keys = await kv.keys('mapping:*')

    const mappings = await Promise.all(
      keys.map(async (key) => {
        const data = await kv.get(key)
        return data
      })
    )

    return NextResponse.json(mappings.filter(Boolean))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to list mappings' }, { status: 500 })
  }
}