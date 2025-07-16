import { NextRequest } from 'next/server'

export const runtime = 'edge' // optional: run at the CDN edge

export async function GET(
  req: NextRequest,
  { params }: { params: { z: string; x: string; y: string } },
) {
  const { z, x, y } = await params
  const layer = req.nextUrl.searchParams.get('layer')
  const apiKey = process.env.MML_API_KEY

  if (!layer) {
    return new Response('Missing layer parameter', { status: 400 })
  }

  if (!apiKey) {
    console.error('MML_API_KEY is not set in environment variables.')
    return new Response('API key not configured', { status: 500 })
  }

  // Upstream request that *includes* the secret key
  const upstream = `https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&FORMAT=image/png&TILEMATRIXSET=WGS84_Pseudo-Mercator&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&api-key=${apiKey}`

  // Stream the binary body straight through without buffering
  const res = await fetch(upstream, { cache: 'no-store' })

  // Forward the stream plus a long-lived public cache header
  return new Response(res.body, {
    status: res.status,
    headers: {
      // Preserve correct MIME type
      'Content-Type': res.headers.get('Content-Type') ?? 'image/png',
      // 30 days; the CDN will cache identical tiles for everyone
      'Cache-Control': 'public, max-age=2592000, immutable',
    },
  })
}
