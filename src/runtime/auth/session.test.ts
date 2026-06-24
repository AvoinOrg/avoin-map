import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

import type * as ServerModule from './server'
import type * as SessionModule from './session'
import type * as TypesModule from './types'

jest.mock('./server', () => ({
  getStartAuth: jest.fn(),
}))

let appendStartAuthSetCookieHeaders: typeof SessionModule.appendStartAuthSetCookieHeaders
let getStartAccessToken: typeof SessionModule.getStartAccessToken
let getStartAuthSession: typeof SessionModule.getStartAuthSession
let START_AUTH_REFRESH_ERROR: typeof TypesModule.START_AUTH_REFRESH_ERROR

type GetStartAuthMock = {
  mockReset: () => void
  mockReturnValue: (value: unknown) => void
}

let getStartAuthMock: GetStartAuthMock

type MockSessionParams = {
  headers: Headers
}

type MockAccessTokenParams = MockSessionParams & {
  body: {
    providerId: string
  }
  request?: Request
  returnHeaders: true
}

const createMockAuth = () => {
  const getSession =
    jest.fn<(params: MockSessionParams) => Promise<unknown>>()
  const getAccessToken =
    jest.fn<(params: MockAccessTokenParams) => Promise<unknown>>()

  getStartAuthMock.mockReturnValue({
    api: {
      getSession,
      getAccessToken,
    },
  })

  return { getAccessToken, getSession }
}

describe('Start auth session helpers', () => {
  beforeAll(async () => {
    const server = await import('./server')
    const session = await import('./session')
    const types = await import('./types')

    appendStartAuthSetCookieHeaders = session.appendStartAuthSetCookieHeaders
    getStartAccessToken = session.getStartAccessToken
    getStartAuthSession = session.getStartAuthSession
    START_AUTH_REFRESH_ERROR = types.START_AUTH_REFRESH_ERROR
    getStartAuthMock = (server as unknown as typeof ServerModule)
      .getStartAuth as unknown as GetStartAuthMock
  })

  beforeEach(() => {
    getStartAuthMock.mockReset()
  })

  it('normalizes the Better Auth session user shape', async () => {
    const { getSession } = createMockAuth()

    getSession.mockResolvedValue({
      session: {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: '2027-01-02T03:04:05.000Z',
      },
      user: {
        id: 'user-id',
        name: 'Ada Lovelace',
        email: 'ada@example.org',
        image: 'https://example.org/ada.png',
        loginName: 'ada@example.org',
      },
    })

    const session = await getStartAuthSession({
      headers: { cookie: 'better-auth.session_token=session-token' },
    })

    expect(session).toEqual({
      session: {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: new Date('2027-01-02T03:04:05.000Z'),
      },
      user: {
        id: 'user-id',
        name: 'Ada Lovelace',
        email: 'ada@example.org',
        image: 'https://example.org/ada.png',
        loginName: 'ada@example.org',
      },
    })
    expect(getSession.mock.calls[0]?.[0].headers.get('cookie')).toBe(
      'better-auth.session_token=session-token'
    )
  })

  it('requests the Zitadel access token and keeps returned Set-Cookie headers', async () => {
    const { getAccessToken, getSession } = createMockAuth()
    const accessTokenExpiresAt = new Date('2027-02-03T04:05:06.000Z')
    const request = {
      headers: new Headers({
        cookie: 'better-auth.session_token=session-token',
      }),
    } as Request
    const responseHeaders = new Headers({
      'set-cookie': 'better-auth.account_data=refreshed; HttpOnly',
    })

    getSession.mockResolvedValue({
      session: {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: '2027-01-02T03:04:05.000Z',
      },
      user: {
        id: 'user-id',
      },
    })
    getAccessToken.mockResolvedValue({
      headers: responseHeaders,
      response: {
        accessToken: 'access-token',
        accessTokenExpiresAt,
        scopes: ['openid', 'email', 'profile', 'offline_access'],
      },
    })

    const result = await getStartAccessToken({ request })

    expect(getAccessToken.mock.calls[0]?.[0]).toMatchObject({
      body: {
        providerId: 'zitadel',
      },
      request,
      returnHeaders: true,
    })
    expect(getAccessToken.mock.calls[0]?.[0].headers.get('cookie')).toBe(
      'better-auth.session_token=session-token'
    )
    expect(result).toEqual({
      ok: true,
      accessToken: 'access-token',
      accessTokenExpiresAt,
      scopes: ['openid', 'email', 'profile', 'offline_access'],
      responseHeaders,
    })
  })

  it('returns the current refresh-error contract when access-token refresh fails', async () => {
    const { getAccessToken, getSession } = createMockAuth()

    getSession.mockResolvedValue({
      session: {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: '2027-01-02T03:04:05.000Z',
      },
      user: {
        id: 'user-id',
      },
    })
    getAccessToken.mockRejectedValue(new Error('provider refresh failed'))

    await expect(
      getStartAccessToken({ headers: { cookie: 'session=present' } })
    ).resolves.toEqual({
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      responseHeaders: null,
      error: START_AUTH_REFRESH_ERROR,
    })
  })

  it('forwards Better Auth Set-Cookie headers for refreshed account cookies', () => {
    const target = new Headers()
    const source = new Headers()

    Object.defineProperty(source, 'getSetCookie', {
      value: () => [
        'better-auth.account_data=one; HttpOnly',
        'better-auth.account_data.1=two; HttpOnly',
      ],
    })

    appendStartAuthSetCookieHeaders({ target, source })

    expect(target.get('set-cookie')).toContain('better-auth.account_data=one')
    expect(target.get('set-cookie')).toContain('better-auth.account_data.1=two')
  })
})
