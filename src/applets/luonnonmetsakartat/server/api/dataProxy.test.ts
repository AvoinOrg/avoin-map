import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import { ReadableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'
import { MessageChannel, MessagePort } from 'worker_threads'
import type * as UndiciModule from 'undici'

import {
  MOCK_AUTH_ACCESS_TOKEN,
  MOCK_AUTH_REJECTED_ACCESS_TOKEN,
} from '#/common/auth/mock'
import { handleLuonnonmetsakartatDataProxyRequest } from './dataProxy'
import {
  getLuonnonmetsakartatMockLayerAreas,
  getLuonnonmetsakartatMockLayers,
  resetLuonnonmetsakartatMockApiForTests,
} from './mockDataStore'

const mockEnv = {
  LUONNONMETSAKARTAT_MOCK_API_ENABLED: '1',
  NODE_ENV: 'test',
}

const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
})

type MockLayerApiItem = {
  id: string
  name?: string
  description?: string
  color_code?: string
  created_ts: number
  updated_ts: number
  is_hidden?: boolean
  col_options?: {
    areaCol?: string
    indexingStrategy?: string
    municipalityCol?: string
    nameCol?: string
  }
}

const readJson = async <T = unknown>(response: Response) =>
  (await response.json()) as T

describe('handleLuonnonmetsakartatDataProxyRequest', () => {
  beforeAll(() => {
    globalThis.ReadableStream =
      ReadableStream as unknown as typeof globalThis.ReadableStream
    globalThis.TextDecoder =
      TextDecoder as unknown as typeof globalThis.TextDecoder
    globalThis.TextEncoder =
      TextEncoder as unknown as typeof globalThis.TextEncoder
    globalThis.MessageChannel =
      MessageChannel as unknown as typeof globalThis.MessageChannel
    globalThis.MessagePort =
      MessagePort as unknown as typeof globalThis.MessagePort

    const undici = jest.requireActual<typeof UndiciModule>('undici')

    globalThis.Headers = undici.Headers as unknown as typeof Headers
    globalThis.Request = undici.Request as unknown as typeof Request
    globalThis.Response = undici.Response as unknown as typeof Response
  })

  beforeEach(() => {
    resetLuonnonmetsakartatMockApiForTests()
  })

  it('returns 500 without calling upstream when LUONNONMETSAKARTAT_API_URL is missing', async () => {
    const fetchFn = jest.fn<typeof fetch>()

    const response = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layers'
      ),
      deps: {
        env: {},
        fetchFn,
      },
    })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe(
      'LUONNONMETSAKARTAT_API_URL is not configured'
    )
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('proxies GET requests to the matching upstream path and query', async () => {
    const fetchFn = jest.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify([{ id: 'layer-1' }]), { status: 200 })
    )

    const response = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layer/layer-1?include=stats',
        {
          headers: {
            Authorization: 'Bearer token-1',
          },
        }
      ),
      deps: {
        env: {
          LUONNONMETSAKARTAT_API_URL: 'https://forests.example.org/api/',
        },
        fetchFn,
      },
    })
    const init = fetchFn.mock.calls[0]?.[1]
    const headers = init?.headers as Headers

    expect(new URL(String(fetchFn.mock.calls[0]?.[0])).toString()).toBe(
      'https://forests.example.org/api/layer/layer-1?include=stats'
    )
    expect(init?.method).toBe('GET')
    expect(headers.get('authorization')).toBe('Bearer token-1')
    expect(response.status).toBe(200)
  })

  it('proxies request bodies and allowlisted headers when mock mode is disabled', async () => {
    const fetchFn = jest.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify({ status: 'queued' }), { status: 202 })
    )

    const response = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layer/layer-1',
        {
          body: JSON.stringify({ is_hidden: true }),
          headers: {
            Authorization: 'Bearer token-1',
            'Content-Type': 'application/json',
            Cookie: 'do-not-forward=true',
            'X-User-Agent': 'browser-agent',
          },
          method: 'PATCH',
        }
      ),
      deps: {
        env: {
          LUONNONMETSAKARTAT_API_URL: 'https://forests.example.org/api/',
        },
        fetchFn,
      },
    })
    const init = fetchFn.mock.calls[0]?.[1]
    const headers = init?.headers as Headers

    expect(new URL(String(fetchFn.mock.calls[0]?.[0])).toString()).toBe(
      'https://forests.example.org/api/layer/layer-1'
    )
    expect(init?.method).toBe('PATCH')
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toBe(
      '{"is_hidden":true}'
    )
    expect(headers.get('authorization')).toBe('Bearer token-1')
    expect(headers.get('content-type')).toBe('application/json')
    expect(headers.get('x-user-agent')).toBe('browser-agent')
    expect(headers.has('cookie')).toBe(false)
    expect(response.status).toBe(202)
  })

  it('refuses mock API mode in production before proxying', async () => {
    const fetchFn = jest.fn<typeof fetch>()

    await expect(
      handleLuonnonmetsakartatDataProxyRequest({
        request: new Request(
          'https://map.example.org/api/luonnonmetsakartat/layers'
        ),
        deps: {
          env: {
            LUONNONMETSAKARTAT_MOCK_API_ENABLED: 'yes',
            LUONNONMETSAKARTAT_API_URL: 'https://forests.example.org/api',
            NODE_ENV: 'production',
          },
          fetchFn,
        },
      })
    ).rejects.toThrow(
      'Luonnonmetsakartat mock API cannot be enabled when NODE_ENV=production. Unset LUONNONMETSAKARTAT_MOCK_API_ENABLED.'
    )
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('serves public mock layers without upstream config or auth', async () => {
    const fetchFn = jest.fn<typeof fetch>()

    const response = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layers'
      ),
      deps: {
        env: mockEnv,
        fetchFn,
      },
    })
    const data = await readJson<MockLayerApiItem[]>(response)

    expect(response.status).toBe(200)
    expect(data.map((layer) => layer.id)).toEqual([
      'mock-visible-layer',
      'mock-empty-layer',
    ])
    expect(data.some((layer) => layer.id === 'mock-hidden-layer')).toBe(false)
    expect(data[0]).toEqual(
      expect.objectContaining({
        id: 'mock-visible-layer',
        color_code: '#2f855a',
        created_ts: 1_735_689_600,
        updated_ts: 1_735_776_000,
      })
    )
    expect(data[0]).not.toHaveProperty('is_hidden')
    expect(data[0]).not.toHaveProperty('col_options')
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('serves admin mock layers including hidden layers and col_options', async () => {
    const response = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layers',
        {
          headers: {
            Authorization: `bearer ${MOCK_AUTH_ACCESS_TOKEN}`,
          },
        }
      ),
      deps: {
        env: mockEnv,
      },
    })
    const data = await readJson<MockLayerApiItem[]>(response)

    expect(response.status).toBe(200)
    expect(data.map((layer) => layer.id)).toEqual([
      'mock-visible-layer',
      'mock-hidden-layer',
      'mock-empty-layer',
    ])
    expect(data.find((layer) => layer.id === 'mock-hidden-layer')).toEqual(
      expect.objectContaining({
        is_hidden: true,
        col_options: expect.objectContaining({
          indexingStrategy: 'id',
          nameCol: 'name',
          municipalityCol: 'municipality',
        }),
      })
    )
    expect(data.every((layer) => layer.col_options != null)).toBe(true)
  })

  it('does not fall back to public layers for rejected or unknown auth', async () => {
    const rejectedResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layers',
        {
          headers: createAuthHeaders(MOCK_AUTH_REJECTED_ACCESS_TOKEN),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })
    const unknownResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layers',
        {
          headers: createAuthHeaders('unknown-token'),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })

    expect(rejectedResponse.status).toBe(403)
    expect(await readJson(rejectedResponse)).toEqual({
      error: 'Mock admin access rejected',
      is_editor: false,
      is_admin: false,
    })
    expect(unknownResponse.status).toBe(401)
    expect(await readJson(unknownResponse)).toEqual({
      error: 'Mock admin authorization required',
      is_editor: false,
      is_admin: false,
    })
  })

  it('validates verified, rejected, missing, and unknown mock admin auth', async () => {
    const verifiedResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/admin/validate',
        {
          headers: createAuthHeaders(MOCK_AUTH_ACCESS_TOKEN),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })
    const rejectedResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/admin/validate',
        {
          headers: createAuthHeaders(MOCK_AUTH_REJECTED_ACCESS_TOKEN),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })
    const missingResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/admin/validate'
      ),
      deps: {
        env: mockEnv,
      },
    })
    const unknownResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/admin/validate',
        {
          headers: createAuthHeaders('unknown-token'),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })

    expect(verifiedResponse.status).toBe(200)
    expect(await readJson(verifiedResponse)).toEqual({
      is_editor: true,
      is_admin: true,
    })
    expect(rejectedResponse.status).toBe(403)
    expect(await readJson(rejectedResponse)).toEqual({
      error: 'Mock admin access rejected',
      is_editor: false,
      is_admin: false,
    })
    expect(missingResponse.status).toBe(401)
    expect(await readJson(missingResponse)).toEqual({
      error: 'Mock admin authorization required',
      is_editor: false,
      is_admin: false,
    })
    expect(unknownResponse.status).toBe(401)
  })

  it('serves admin layer detail and deterministic layer id errors', async () => {
    const knownResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layer/mock-visible-layer',
        {
          headers: createAuthHeaders(MOCK_AUTH_ACCESS_TOKEN),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })
    const unknownResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layer/unknown-layer',
        {
          headers: createAuthHeaders(MOCK_AUTH_ACCESS_TOKEN),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })
    const missingIdResponse = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layer',
        {
          headers: createAuthHeaders(MOCK_AUTH_ACCESS_TOKEN),
        }
      ),
      deps: {
        env: mockEnv,
      },
    })

    expect(knownResponse.status).toBe(200)
    expect(await readJson(knownResponse)).toEqual(
      expect.objectContaining({
        id: 'mock-visible-layer',
        name: 'Mock visible forest layer',
        color_code: '#2f855a',
        is_hidden: false,
        created_ts: 1_735_689_600,
        updated_ts: 1_735_776_000,
        col_options: expect.objectContaining({
          areaCol: 'area_ha',
        }),
      })
    )
    expect(unknownResponse.status).toBe(404)
    expect(await readJson(unknownResponse)).toEqual({
      error: 'Mock layer not found',
    })
    expect(missingIdResponse.status).toBe(400)
    expect(await readJson(missingIdResponse)).toEqual({
      error: 'Missing required layer id',
    })
  })

  it('returns method-not-allowed errors for out-of-scope mock mutations', async () => {
    const response = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layers',
        {
          method: 'POST',
        }
      ),
      deps: {
        env: mockEnv,
      },
    })

    expect(response.status).toBe(405)
    expect(await readJson(response)).toEqual({ error: 'Method not allowed' })
  })

  it('keeps resettable mock seed data stable and returns cloned areas', () => {
    const layers = getLuonnonmetsakartatMockLayers()

    expect(layers.map((layer) => [layer.id, layer.created_ts])).toEqual([
      ['mock-visible-layer', 1_735_689_600],
      ['mock-hidden-layer', 1_735_689_660],
      ['mock-empty-layer', 1_735_689_720],
    ])

    layers[0].name = 'Mutated through test clone'
    layers[0].areas.features[0].properties.name = 'Mutated area clone'

    expect(getLuonnonmetsakartatMockLayers()[0]).toEqual(
      expect.objectContaining({
        id: 'mock-visible-layer',
        name: 'Mock visible forest layer',
      })
    )

    resetLuonnonmetsakartatMockApiForTests()

    const visibleAreas =
      getLuonnonmetsakartatMockLayerAreas('mock-visible-layer')
    const withPictures = visibleAreas?.features.find(
      (feature) => feature.properties.id === 'mock-visible-area-picture'
    )
    const withoutPictures = visibleAreas?.features.find(
      (feature) => feature.properties.id === 'mock-visible-area-no-picture'
    )

    expect(visibleAreas?.features).toHaveLength(2)
    expect(withPictures?.properties).toEqual(
      expect.objectContaining({
        id: 'mock-visible-area-picture',
        name: 'Mock Ridge Forest',
        municipality: 'Espoo',
        region: 'Uusimaa',
        description: 'Old spruce stand with a small wetland edge.',
        date: '2025-05-10',
        area_ha: 12.34,
        layer_id: 'mock-visible-layer',
      })
    )
    expect(JSON.parse(withPictures?.properties.pictures ?? '[]')).toEqual([
      'https://example.org/mock/forest-ridge-1.jpg',
      'https://example.org/mock/forest-ridge-2.jpg',
    ])
    expect(withPictures?.geometry.type).toBe('Polygon')
    expect(withPictures?.geometry.coordinates[0][0]).toEqual([24.85, 60.22])
    expect(withoutPictures?.properties).toEqual(
      expect.objectContaining({
        id: 'mock-visible-area-no-picture',
        municipality: 'Lohja',
        region: 'Uusimaa',
        date: '2024-09-18',
        area_ha: 7.89,
      })
    )
    expect(withoutPictures?.properties.pictures).toBeUndefined()
    expect(
      getLuonnonmetsakartatMockLayerAreas('mock-empty-layer')?.features
    ).toEqual([])
  })
})
