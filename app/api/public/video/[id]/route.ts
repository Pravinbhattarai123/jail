import { NextResponse } from 'next/server'

// Whitelist of remote MP4 sources mapped by numeric id
const SOURCES: Record<string, string> = {
  '1': 'https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp4',
  '2': 'https://storage.googleapis.com/media-session/sintel/trailer.mp4',
  '3': 'https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4',
  '4': 'https://storage.googleapis.com/coverr-main/mp4/Workday.mp4',
  '5': 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
  '6': 'https://storage.googleapis.com/coverr-main/mp4/Workday.mp4',
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const url = SOURCES[id]
  if (!url) {
    return new NextResponse('Not found', { status: 404 })
  }
  try {
    const range = req.headers.get('range') || undefined
    const res = await fetch(url, {
      cache: 'no-store',
      headers: range ? { Range: range } : undefined,
    })
    if (!res.ok || !res.body) {
      return new NextResponse('Upstream error', { status: 502 })
    }
    // Pass-through upstream headers while ensuring CORS and caching
    const headers = new Headers(res.headers)
    if (!headers.get('content-type')) headers.set('Content-Type', 'video/mp4')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Cache-Control', 'no-store')
    // Normalize status (support 206 for range)
    const status = res.status

    return new NextResponse(res.body, { status, headers })
  } catch {
    return new NextResponse('Proxy failed', { status: 500 })
  }
}
