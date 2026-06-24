import { beforeAll, describe, expect, it, jest } from '@jest/globals'
import { ReadableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'
import { MessageChannel, MessagePort } from 'worker_threads'
import type * as UndiciModule from 'undici'

import {
  START_AUTH_REFRESH_ERROR,
  type StartAccessTokenResult,
} from '../auth/types'
import { handleUserinfoRequest } from './userinfo'

type AccessTokenGetter = ({
  request,
}: {
  request: Request
}) => Promise<StartAccessTokenResult>

const createAccessTokenGetter = (result: StartAccessTokenResult) =>
  jest.fn<AccessTokenGetter>(async () => result)

const createOkToken = ({
  responseHeaders = new Headers(),
}: {
  responseHeaders?: Headers
} = {}): StartAccessTokenResult => ({
  ok: true,
  accessToken: 'access-token',
  accessTokenExpiresAt: null,
  scopes: [],
  responseHeaders,
})

const createTokenError = (
  error: Extract<StartAccessTokenResult, { ok: false }>['error'],
  responseHeaders: Headers | null = null
): StartAccessTokenResult => ({
  ok: false,
  accessToken: null,
  accessTokenExpiresAt: null,
  scopes: [],
  responseHeaders,
  error,
})

describe('handleUserinfoRequest', () => {
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

  it('fetches Zitadel userinfo with the Start access token and forwards Set-Cookie headers', async () => {
    const tokenHeaders = new Headers({
      'set-cookie': 'better-auth.account_data=refreshed; HttpOnly',
    })
    const getAccessToken = createAccessTokenGetter(
      createOkToken({ responseHeaders: tokenHeaders })
    )
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ sub: 'user-id' }), { status: 200 })
    )

    const response = await handleUserinfoRequest({
      request: new Request('https://map.example.org/api/userinfo'),
      deps: {
        fetchFn,
        getAccessToken,
        getAuthEnv: () => ({ zitadelIssuer: 'https://auth.example.org' }),
      },
    })

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('{"sub":"user-id"}')
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(response.headers.get('set-cookie')).toContain(
      'better-auth.account_data=refreshed'
    )
    expect(fetchFn).toHaveBeenCalledWith(
      'https://auth.example.org/oidc/v1/userinfo',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'content-type': 'application/json',
        }),
      })
    )
  })

  it('returns 401 for missing sessions without calling Zitadel', async () => {
    const tokenHeaders = new Headers({
      'set-cookie': 'better-auth.session_token=cleared; Max-Age=0',
    })
    const fetchFn = jest.fn<typeof fetch>()

    const response = await handleUserinfoRequest({
      request: new Request('https://map.example.org/api/userinfo'),
      deps: {
        fetchFn,
        getAccessToken: createAccessTokenGetter(
          createTokenError('NoSession', tokenHeaders)
        ),
      },
    })

    expect(response.status).toBe(401)
    expect(response.headers.get('set-cookie')).toContain(
      'better-auth.session_token=cleared'
    )
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it.each(['NoAccessToken', START_AUTH_REFRESH_ERROR] as const)(
    'returns 401 for %s token failures',
    async (error) => {
      const fetchFn = jest.fn<typeof fetch>()

      const response = await handleUserinfoRequest({
        request: new Request('https://map.example.org/api/userinfo'),
        deps: {
          fetchFn,
          getAccessToken: createAccessTokenGetter(createTokenError(error)),
        },
      })

      expect(response.status).toBe(401)
      expect(fetchFn).not.toHaveBeenCalled()
    }
  )

  it('propagates non-OK Zitadel responses', async () => {
    const fetchFn = jest.fn<typeof fetch>(async () =>
      new Response('denied', {
        status: 403,
        statusText: 'Forbidden',
      })
    )

    const response = await handleUserinfoRequest({
      request: new Request('https://map.example.org/api/userinfo'),
      deps: {
        fetchFn,
        getAccessToken: createAccessTokenGetter(createOkToken()),
        getAuthEnv: () => ({ zitadelIssuer: 'https://auth.example.org' }),
      },
    })

    expect(response.status).toBe(403)
    expect(response.statusText).toBe('Forbidden')
    expect(await response.text()).toBe('denied')
  })

  it('returns a non-secret 500 response for unexpected failures', async () => {
    const logger = { error: jest.fn() }
    const response = await handleUserinfoRequest({
      request: new Request('https://map.example.org/api/userinfo'),
      deps: {
        fetchFn: jest.fn<typeof fetch>(async () => {
          throw new Error('network failed for access-token')
        }),
        getAccessToken: createAccessTokenGetter(createOkToken()),
        getAuthEnv: () => ({ zitadelIssuer: 'https://auth.example.org' }),
        logger,
      },
    })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal server error')
    expect(logger.error).toHaveBeenCalled()
  })
})
