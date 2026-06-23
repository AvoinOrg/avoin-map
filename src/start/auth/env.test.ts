import { describe, expect, it } from '@jest/globals'

import { resolveStartAuthEnv } from './env'

const baseEnv = {
  BETTER_AUTH_SECRET: '12345678901234567890123456789012',
  BETTER_AUTH_URL: 'http://localhost:3001',
  ZITADEL_CLIENT_ID: 'client-id',
  ZITADEL_CLIENT_SECRET: 'client-secret',
  NEXT_PUBLIC_ZITADEL_ISSUER: 'https://public-issuer.example.org',
}

describe('resolveStartAuthEnv', () => {
  it('uses server-only Zitadel issuer before the public migration fallback', () => {
    const env = resolveStartAuthEnv({
      ...baseEnv,
      ZITADEL_ISSUER: 'https://server-issuer.example.org',
    })

    expect(env.zitadelIssuer).toBe('https://server-issuer.example.org')
  })

  it('keeps the current public Zitadel issuer as a migration fallback', () => {
    const env = resolveStartAuthEnv(baseEnv)

    expect(env.zitadelIssuer).toBe('https://public-issuer.example.org')
  })

  it('parses optional trusted origins from comma-separated env', () => {
    const env = resolveStartAuthEnv({
      ...baseEnv,
      BETTER_AUTH_TRUSTED_ORIGINS:
        'http://localhost:3000, https://map.example.org, ',
    })

    expect(env.trustedOrigins).toEqual([
      'http://localhost:3000',
      'https://map.example.org',
    ])
  })

  it('throws a clear server-side error for missing Better Auth secret', () => {
    expect(() =>
      resolveStartAuthEnv({
        ...baseEnv,
        BETTER_AUTH_SECRET: '',
      })
    ).toThrow('Start Better Auth requires BETTER_AUTH_SECRET')
  })
})
