import { describe, expect, it } from '@jest/globals'

import { AUTH_REFRESH_ERROR } from './constants'
import {
  getAuthSessionStatus,
  normalizeAuthAccessTokenResult,
  normalizeAuthSessionData,
} from './normalize'

describe('auth client normalization', () => {
  it('normalizes a Better Auth session with a Zitadel access token', () => {
    const session = normalizeAuthSessionData(
      {
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
      },
      {
        accessToken: 'access-token',
        accessTokenExpiresAt: new Date('2027-02-03T04:05:06.000Z'),
      }
    )

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
      accessToken: 'access-token',
      accessTokenExpiresAt: new Date('2027-02-03T04:05:06.000Z'),
    })
  })

  it('maps Better Auth access-token failures to the existing refresh error', () => {
    expect(
      normalizeAuthAccessTokenResult({
        data: null,
        error: {
          status: 400,
          statusText: 'Bad Request',
        },
      })
    ).toEqual({
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      error: AUTH_REFRESH_ERROR,
    })
  })

  it('keeps authenticated sessions loading until the access token is resolved', () => {
    expect(
      getAuthSessionStatus({
        hasSession: true,
        isSessionPending: false,
        isAccessTokenLoading: true,
      })
    ).toBe('loading')
    expect(
      getAuthSessionStatus({
        hasSession: true,
        isSessionPending: false,
        isAccessTokenLoading: false,
      })
    ).toBe('authenticated')
  })
})

