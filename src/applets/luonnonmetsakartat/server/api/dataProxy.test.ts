import { beforeAll, describe, expect, it, jest } from '@jest/globals'
import { ReadableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'
import { MessageChannel, MessagePort } from 'worker_threads'
import type * as UndiciModule from 'undici'

import { handleLuonnonmetsakartatDataProxyRequest } from './dataProxy'

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

  it('proxies requests to LUONNONMETSAKARTAT_API_URL', async () => {
    const fetchFn = jest.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify([{ id: 'layer-1' }]), { status: 200 })
    )

    const response = await handleLuonnonmetsakartatDataProxyRequest({
      request: new Request(
        'https://map.example.org/api/luonnonmetsakartat/layer/layer-1',
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
      'https://forests.example.org/api/layer/layer-1'
    )
    expect(init?.method).toBe('GET')
    expect(headers.get('authorization')).toBe('Bearer token-1')
    expect(response.status).toBe(200)
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
})
