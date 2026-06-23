import { beforeAll, describe, expect, it, jest } from '@jest/globals'
import { ReadableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'
import { MessageChannel, MessagePort } from 'worker_threads'
import type * as UndiciModule from 'undici'

import {
  handleMmlTileProxyRequest,
  type MmlTileProxyParams,
} from './mmlTileProxy'

const params: MmlTileProxyParams = {
  z: '4',
  x: '2',
  y: '3',
}

describe('handleMmlTileProxyRequest', () => {
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

  it('returns 400 when the layer query parameter is missing', async () => {
    const fetchFn = jest.fn<typeof fetch>()

    const response = await handleMmlTileProxyRequest({
      request: new Request('https://map.example.org/api/map/core/mml/tms/4/2/3'),
      params,
      deps: {
        env: { MML_API_KEY: 'secret-key' },
        fetchFn,
      },
    })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Missing layer parameter')
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('returns 500 when MML_API_KEY is missing without exposing a key-bearing URL', async () => {
    const fetchFn = jest.fn<typeof fetch>()
    const logger = { error: jest.fn() }

    const response = await handleMmlTileProxyRequest({
      request: new Request(
        'https://map.example.org/api/map/core/mml/tms/4/2/3?layer=taustakartta'
      ),
      params,
      deps: {
        env: {},
        fetchFn,
        logger,
      },
    })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('API key not configured')
    expect([...response.headers.entries()].join('\n')).not.toContain('api-key')
    expect(fetchFn).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalled()
  })

  it('builds an encoded WMTS upstream URL and streams binary response headers safely', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71])
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(bytes, {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'image/jpeg',
        },
      })
    )

    const response = await handleMmlTileProxyRequest({
      request: new Request(
        'https://map.example.org/api/map/core/mml/tms/4/2/3?layer=selko kartta/ä'
      ),
      params,
      deps: {
        env: { MML_API_KEY: 'secret-key' },
        fetchFn,
      },
    })
    const upstream = new URL(String(fetchFn.mock.calls[0]?.[0]))
    const init = fetchFn.mock.calls[0]?.[1]

    expect(upstream.origin).toBe(
      'https://avoin-karttakuva.maanmittauslaitos.fi'
    )
    expect(upstream.pathname).toBe('/avoin/wmts')
    expect(upstream.searchParams.get('SERVICE')).toBe('WMTS')
    expect(upstream.searchParams.get('REQUEST')).toBe('GetTile')
    expect(upstream.searchParams.get('VERSION')).toBe('1.0.0')
    expect(upstream.searchParams.get('LAYER')).toBe('selko kartta/ä')
    expect(upstream.searchParams.get('STYLE')).toBe('default')
    expect(upstream.searchParams.get('FORMAT')).toBe('image/png')
    expect(upstream.searchParams.get('TILEMATRIXSET')).toBe(
      'WGS84_Pseudo-Mercator'
    )
    expect(upstream.searchParams.get('TILEMATRIX')).toBe('4')
    expect(upstream.searchParams.get('TILEROW')).toBe('3')
    expect(upstream.searchParams.get('TILECOL')).toBe('2')
    expect(upstream.searchParams.get('api-key')).toBe('secret-key')
    expect(init).toEqual({ cache: 'no-store' })
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/jpeg')
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=2592000, immutable'
    )
    expect([...response.headers.entries()].join('\n')).not.toContain(
      'secret-key'
    )
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
  })

  it('propagates upstream status and falls back to image/png content type', async () => {
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(null, {
        status: 404,
        statusText: 'Not Found',
      })
    )

    const response = await handleMmlTileProxyRequest({
      request: new Request(
        'https://map.example.org/api/map/core/mml/tms/4/2/3?layer=taustakartta'
      ),
      params,
      deps: {
        env: { MML_API_KEY: 'secret-key' },
        fetchFn,
      },
    })

    expect(response.status).toBe(404)
    expect(response.statusText).toBe('Not Found')
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=2592000, immutable'
    )
  })
})
