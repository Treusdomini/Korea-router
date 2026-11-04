import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await kv.del(`mapping:${id}`)
    await kv.srem('mapping:ids', id) // also remove from the index

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
