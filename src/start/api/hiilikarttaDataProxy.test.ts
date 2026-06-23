import { beforeAll, describe, expect, it, jest } from '@jest/globals'
import { ReadableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'
import { MessageChannel, MessagePort } from 'worker_threads'
import type * as UndiciModule from 'undici'

import { handleHiilikarttaDataProxyRequest } from './hiilikarttaDataProxy'

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

    globalThis.FormData = undici.FormData as unknown as typeof FormData
    globalThis.Headers = undici.Headers as unknown as typeof Headers
    globalThis.Request = undici.Request as unknown as typeof Request
    globalThis.Response = undici.Response as unknown as typeof Response
  })

  it('returns 500 without calling upstream when HIILIKARTTA_API_URL is missing', async () => {
    const fetchFn = jest.fn<typeof fetch>()

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request('https://map.example.org/fi/hiilikartta/api/data'),
      deps: {
        env: {},
        fetchFn,
      },
    })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('HIILIKARTTA_API_URL is not configured')
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('proxies GET to /calculation without id when the query parameter is absent', async () => {
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
    )

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request('https://map.example.org/fi/hiilikartta/api/data'),
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api/' },
        fetchFn,
      },
    })
    const upstream = new URL(String(fetchFn.mock.calls[0]?.[0]))

    expect(upstream.toString()).toBe('https://carbon.example.org/api/calculation')
    expect(upstream.searchParams.has('id')).toBe(false)
    expect(fetchFn.mock.calls[0]?.[1]).toBeUndefined()
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('{"status":"ok"}')
  })

  it('proxies GET to /calculation with the id query parameter', async () => {
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ id: 'calc-1' }), { status: 200 })
    )

    await handleHiilikarttaDataProxyRequest({
      request: new Request(
        'https://map.example.org/fi/hiilikartta/api/data?id=calc-1&ignored=1'
      ),
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api' },
        fetchFn,
      },
    })
    const upstream = new URL(String(fetchFn.mock.calls[0]?.[0]))

    expect(upstream.toString()).toBe(
      'https://carbon.example.org/api/calculation?id=calc-1'
    )
  })

  it('proxies standalone applet API GET paths with the id query parameter', async () => {
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ id: 'calc-standalone' }), { status: 200 })
    )

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request(
        'https://map.example.org/fi/api/data?id=calc-standalone'
      ),
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api' },
        fetchFn,
      },
    })
    const upstream = new URL(String(fetchFn.mock.calls[0]?.[0]))

    expect(upstream.toString()).toBe(
      'https://carbon.example.org/api/calculation?id=calc-standalone'
    )
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('{"id":"calc-standalone"}')
  })

  it('proxies POST multipart form data without manually setting Content-Type', async () => {
    const formData = new FormData()
    formData.append('file', 'zip-data')
    const request = new Request(
      'https://map.example.org/fi/hiilikartta/api/data?id=calc-1',
      { method: 'POST' }
    )
    Object.defineProperty(request, 'formData', {
      value: jest.fn(async () => formData),
    })
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ status: 'queued' }), { status: 200 })
    )

    const response = await handleHiilikarttaDataProxyRequest({
      request,
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api' },
        fetchFn,
      },
    })
    const upstream = new URL(String(fetchFn.mock.calls[0]?.[0]))
    const init = fetchFn.mock.calls[0]?.[1]

    expect(upstream.toString()).toBe(
      'https://carbon.example.org/api/calculation?id=calc-1'
    )
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(formData)
    expect(init?.headers).toBeUndefined()
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('{"status":"queued"}')
  })

  it('maps upstream non-OK responses to the upstream status and serialized body', async () => {
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ error: 'bad input' }), {
        status: 422,
        statusText: 'Unprocessable Entity',
      })
    )

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request('https://map.example.org/fi/hiilikartta/api/data'),
      deps: {
        env: { HIILIKARTTA_API_URL: 'https://carbon.example.org/api' },
        fetchFn,
      },
    })

    expect(response.status).toBe(422)
    expect(response.statusText).toBe('Unprocessable Entity')
    expect(await response.text()).toBe('{"error":"bad input"}')
  })

  it('maps upstream fetch failures to the no-response contract', async () => {
    const logger = { error: jest.fn() }
    const fetchFn = jest.fn<typeof fetch>(async () => {
      throw new TypeError('fetch failed')
    })

    const response = await handleHiilikarttaDataProxyRequest({
      request: new Request('https://map.example.org/fi/hiilikartta/api/data'),
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
