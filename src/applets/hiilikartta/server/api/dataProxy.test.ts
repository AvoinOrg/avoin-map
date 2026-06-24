import { beforeAll, describe, expect, it, jest } from '@jest/globals'
import { ReadableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'
import { MessageChannel, MessagePort } from 'worker_threads'
import type * as UndiciModule from 'undici'

import { handleHiilikarttaDataProxyRequest } from './dataProxy'

describe('handleHiilikarttaDataProxyRequest', () => {
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

  it('returns 500 without calling upstream when HIILIKARTTA_API_URL is missing', async () => {
    const fetchFn = jest.fn<typeof fetch>()

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request('https://map.example.org/api/hiilikartta/plan'),
      deps: {
        env: {},
        fetchFn,
      },
    })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('HIILIKARTTA_API_URL is not configured')
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('proxies GET requests to the matching upstream path and query', async () => {
    const fetchFn = jest.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify({ id: 'calc-1' }), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        })
    )

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/hiilikartta/calculation?id=calc-1&visible_id=local-1'
      ),
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api/' },
        fetchFn,
      },
    })
    const upstream = new URL(String(fetchFn.mock.calls[0]?.[0]))

    expect(upstream.toString()).toBe(
      'https://carbon.example.org/api/calculation?id=calc-1&visible_id=local-1'
    )
    expect(fetchFn.mock.calls[0]?.[1]?.method).toBe('GET')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(await response.text()).toBe('{"id":"calc-1"}')
  })

  it('proxies request bodies and allowlisted headers', async () => {
    const fetchFn = jest.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify({ status: 'queued' }), { status: 201 })
    )

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/hiilikartta/plan?id=calc-1',
        {
          body: 'zip-data',
          headers: {
            Authorization: 'Bearer token-1',
            'Content-Type': 'application/zip',
            Cookie: 'do-not-forward=true',
            'X-User-Agent': 'browser-agent',
          },
          method: 'PUT',
        }
      ),
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api' },
        fetchFn,
      },
    })
    const init = fetchFn.mock.calls[0]?.[1]
    const headers = init?.headers as Headers

    expect(new URL(String(fetchFn.mock.calls[0]?.[0])).toString()).toBe(
      'https://carbon.example.org/api/plan?id=calc-1'
    )
    expect(init?.method).toBe('PUT')
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toBe('zip-data')
    expect(headers.get('authorization')).toBe('Bearer token-1')
    expect(headers.get('content-type')).toBe('application/zip')
    expect(headers.get('x-user-agent')).toBe('browser-agent')
    expect(headers.has('cookie')).toBe(false)
    expect(response.status).toBe(201)
  })

  it('maps upstream fetch failures to the no-response contract', async () => {
    const logger = { error: jest.fn() }
    const fetchFn = jest.fn<typeof fetch>(async () => {
      throw new TypeError('fetch failed')
    })

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request('https://map.example.org/api/hiilikartta/plan'),
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api' },
        fetchFn,
        logger,
      },
    })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('No response from server')
    expect(logger.error).toHaveBeenCalled()
  })
})
