import { beforeAll, describe, expect, it } from '@jest/globals'

import { isStartBetterAuthRequest, rewriteStartAuthRequest } from './request'

beforeAll(() => {
  globalThis.Request = class {
    url: string

    constructor(input: URL | string) {
      this.url = input.toString()
    }
  } as typeof Request
})

describe('rewriteStartAuthRequest', () => {
  it('rewrites the legacy Zitadel callback route to the Generic OAuth callback handler', () => {
    const request = new Request(
      'http://localhost:3000/api/auth/callback/zitadel?code=auth-code&state=state'
    )
    const rewritten = rewriteStartAuthRequest(request)

    expect(rewritten.url).toBe(
      'http://localhost:3000/api/auth/oauth2/callback/zitadel?code=auth-code&state=state'
    )
  })

  it('leaves non-legacy auth requests untouched', () => {
    const request = new Request(
      'http://localhost:3000/api/auth/sign-in/oauth2'
    )

    expect(rewriteStartAuthRequest(request)).toBe(request)
  })
})

describe('isStartBetterAuthRequest', () => {
  it.each([
    '/api/auth/get-session',
    '/api/auth/get-access-token',
    '/api/auth/sign-in/oauth2',
    '/api/auth/sign-out',
    '/api/auth/oauth2/callback/zitadel',
    '/api/auth/callback/zitadel',
    '/api/auth/error',
  ])('routes %s to the Better Auth handler', (path) => {
    expect(
      isStartBetterAuthRequest(new Request(`http://localhost:3000${path}`))
    ).toBe(true)
  })

  it.each([
    '/api/auth/session',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/csrf',
    '/api/auth/providers',
  ])('keeps legacy NextAuth path %s on the NextAuth handler', (path) => {
    expect(
      isStartBetterAuthRequest(new Request(`http://localhost:3000${path}`))
    ).toBe(false)
  })
})
