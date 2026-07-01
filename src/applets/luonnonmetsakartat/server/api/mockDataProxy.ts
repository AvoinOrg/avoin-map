import {
  MOCK_AUTH_ACCESS_TOKEN,
  MOCK_AUTH_REJECTED_ACCESS_TOKEN,
} from '#/common/auth/mock'
import {
  getLuonnonmetsakartatMockLayer,
  getLuonnonmetsakartatMockLayers,
} from './mockDataStore'

type LuonnonmetsakartatMockApiEnv = Record<string, string | undefined> & {
  LUONNONMETSAKARTAT_MOCK_API_ENABLED?: string
  NODE_ENV?: string
}

type MockAuthStatus = 'missing' | 'verified' | 'rejected' | 'unknown'

const ROUTE_PREFIX = '/api/luonnonmetsakartat'
const MOCK_API_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])

const normalizeFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ''

const getDefaultMockApiEnv = (): LuonnonmetsakartatMockApiEnv => ({
  LUONNONMETSAKARTAT_MOCK_API_ENABLED:
    process.env.LUONNONMETSAKARTAT_MOCK_API_ENABLED,
  NODE_ENV: process.env.NODE_ENV,
})

const isTruthyMockApiFlag = (value: string | undefined) =>
  MOCK_API_ENABLED_VALUES.has(normalizeFlag(value))

export const assertLuonnonmetsakartatMockApiAllowed = (
  env: LuonnonmetsakartatMockApiEnv = getDefaultMockApiEnv()
) => {
  if (
    isTruthyMockApiFlag(env.LUONNONMETSAKARTAT_MOCK_API_ENABLED) &&
    env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Luonnonmetsakartat mock API cannot be enabled when NODE_ENV=production. Unset LUONNONMETSAKARTAT_MOCK_API_ENABLED.'
    )
  }
}

export const isLuonnonmetsakartatMockApiEnabled = (
  env: LuonnonmetsakartatMockApiEnv = getDefaultMockApiEnv()
) => {
  assertLuonnonmetsakartatMockApiAllowed(env)

  return isTruthyMockApiFlag(env.LUONNONMETSAKARTAT_MOCK_API_ENABLED)
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })

const jsonErrorResponse = (error: string, status: number) =>
  jsonResponse({ error }, status)

const getMockPath = (request: Request) => {
  const requestUrl = new URL(request.url)
  const normalizedPrefix = ROUTE_PREFIX.replace(/\/+$/, '')

  if (
    requestUrl.pathname !== normalizedPrefix &&
    !requestUrl.pathname.startsWith(`${normalizedPrefix}/`)
  ) {
    return null
  }

  return requestUrl.pathname.slice(normalizedPrefix.length) || '/'
}

const getBearerToken = (request: Request) => {
  const authHeader = request.headers.get('authorization')
  const match = authHeader?.match(/^Bearer\s+(.+)$/i)

  return match?.[1]?.trim() || null
}

const getMockAuthStatus = (request: Request): MockAuthStatus => {
  const token = getBearerToken(request)

  if (!token) {
    return request.headers.has('authorization') ? 'unknown' : 'missing'
  }

  if (token === MOCK_AUTH_ACCESS_TOKEN) {
    return 'verified'
  }

  if (token === MOCK_AUTH_REJECTED_ACCESS_TOKEN) {
    return 'rejected'
  }

  return 'unknown'
}

const getAdminAuthErrorResponse = (authStatus: MockAuthStatus) => {
  if (authStatus === 'rejected') {
    return jsonResponse(
      {
        error: 'Mock admin access rejected',
        is_editor: false,
        is_admin: false,
      },
      403
    )
  }

  return jsonResponse(
    {
      error: 'Mock admin authorization required',
      is_editor: false,
      is_admin: false,
    },
    401
  )
}

const toPublicLayerItem = (
  layer: ReturnType<typeof getLuonnonmetsakartatMockLayers>[number]
) => ({
  id: layer.id,
  name: layer.name,
  description: layer.description,
  created_ts: layer.created_ts,
  updated_ts: layer.updated_ts,
  color_code: layer.color_code,
})

const toAdminLayerItem = (
  layer: ReturnType<typeof getLuonnonmetsakartatMockLayers>[number]
) => ({
  id: layer.id,
  name: layer.name,
  description: layer.description,
  created_ts: layer.created_ts,
  updated_ts: layer.updated_ts,
  color_code: layer.color_code,
  is_hidden: layer.is_hidden,
  col_options: layer.col_options,
})

const handleAdminValidate = (authStatus: MockAuthStatus) => {
  if (authStatus === 'verified') {
    return jsonResponse({ is_editor: true, is_admin: true })
  }

  return getAdminAuthErrorResponse(authStatus)
}

const handleLayers = (authStatus: MockAuthStatus) => {
  if (authStatus === 'missing') {
    return jsonResponse(
      getLuonnonmetsakartatMockLayers()
        .filter((layer) => !layer.is_hidden)
        .map(toPublicLayerItem)
    )
  }

  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  return jsonResponse(getLuonnonmetsakartatMockLayers().map(toAdminLayerItem))
}

const handleLayerDetail = ({
  authStatus,
  layerId,
}: {
  authStatus: MockAuthStatus
  layerId: string
}) => {
  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  const layer = getLuonnonmetsakartatMockLayer(layerId)

  if (!layer) {
    return jsonErrorResponse('Mock layer not found', 404)
  }

  return jsonResponse(toAdminLayerItem(layer))
}

export const handleLuonnonmetsakartatMockApiRequest = async ({
  request,
}: {
  request: Request
}) => {
  const method = request.method.toUpperCase()
  const mockPath = getMockPath(request)

  if (!mockPath) {
    return jsonErrorResponse('Mock proxy path is missing', 404)
  }

  const authStatus = getMockAuthStatus(request)

  if (mockPath === '/admin/validate') {
    return method === 'GET'
      ? handleAdminValidate(authStatus)
      : jsonErrorResponse('Method not allowed', 405)
  }

  if (mockPath === '/layers') {
    return method === 'GET'
      ? handleLayers(authStatus)
      : jsonErrorResponse('Method not allowed', 405)
  }

  if (mockPath === '/layer' || mockPath === '/layer/') {
    return method === 'GET'
      ? jsonErrorResponse('Missing required layer id', 400)
      : jsonErrorResponse('Method not allowed', 405)
  }

  const layerMatch = mockPath.match(/^\/layer\/([^/]+)\/?$/)

  if (layerMatch) {
    return method === 'GET'
      ? handleLayerDetail({
          authStatus,
          layerId: decodeURIComponent(layerMatch[1]),
        })
      : jsonErrorResponse('Method not allowed', 405)
  }

  return jsonErrorResponse(
    'Unsupported Luonnonmetsakartat mock API endpoint',
    404
  )
}
