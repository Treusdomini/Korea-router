import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function DELETE(req: NextRequest) {
  try {
    // Support id from query string (preferred) or JSON body
    let id = req.nextUrl.searchParams.get('id')

    if (!id) {
      try {
        const body = await req.json()
        id = body?.id
      } catch {
        // no body or invalid json
      }
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await kv.del(`mapping:${id}`)
    await kv.srem('mapping:ids', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
