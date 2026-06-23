import { beforeAll, describe, expect, it } from '@jest/globals'

import { rewriteStartAuthRequest } from './request'

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
