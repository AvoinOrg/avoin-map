type EnvSource = Record<string, string | undefined>

type MmlTileProxyLogger = {
  error: (...args: unknown[]) => void
}

export type MmlTileProxyParams = {
  z: string
  x: string
  y: string
}

type MmlTileProxyDeps = {
  env?: EnvSource
  fetchFn?: typeof fetch
  logger?: MmlTileProxyLogger
}

const MML_WMTS_URL =
  'https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts'

const MML_TILE_CACHE_CONTROL = 'public, max-age=2592000, immutable'

const getMmlUpstreamUrl = ({
  apiKey,
  layer,
  params,
}: {
  apiKey: string
  layer: string
  params: MmlTileProxyParams
}) => {
  const upstream = new URL(MML_WMTS_URL)

  upstream.searchParams.set('SERVICE', 'WMTS')
  upstream.searchParams.set('REQUEST', 'GetTile')
  upstream.searchParams.set('VERSION', '1.0.0')
  upstream.searchParams.set('LAYER', layer)
  upstream.searchParams.set('STYLE', 'default')
  upstream.searchParams.set('FORMAT', 'image/png')
  upstream.searchParams.set('TILEMATRIXSET', 'WGS84_Pseudo-Mercator')
  upstream.searchParams.set('TILEMATRIX', params.z)
  upstream.searchParams.set('TILEROW', params.y)
  upstream.searchParams.set('TILECOL', params.x)
  upstream.searchParams.set('api-key', apiKey)

  return upstream
}

export const handleMmlTileProxyRequest = async ({
  deps = {},
  params,
  request,
}: {
  deps?: MmlTileProxyDeps
  params: MmlTileProxyParams
  request: Request
}) => {
  const { env = process.env, fetchFn = fetch, logger = console } = deps
  const layer = new URL(request.url).searchParams.get('layer')
  const apiKey = env.MML_API_KEY?.trim()

  if (!layer) {
    return new Response('Missing layer parameter', { status: 400 })
  }

  if (!apiKey) {
    logger.error('MML_API_KEY is not set in environment variables.')

    return new Response('API key not configured', { status: 500 })
  }

  try {
    const upstreamResponse = await fetchFn(
      getMmlUpstreamUrl({ apiKey, layer, params }),
      { cache: 'no-store' }
    )
    const headers = new Headers({
      'content-type':
        upstreamResponse.headers.get('content-type') ?? 'image/png',
      'cache-control': MML_TILE_CACHE_CONTROL,
    })

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    })
  } catch (error) {
    logger.error('MML tile proxy request failed', error)

    return new Response('Tile upstream request failed', { status: 500 })
  }
}
