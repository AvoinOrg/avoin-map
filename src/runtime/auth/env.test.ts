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
  it('uses Better Auth env values when they are present', () => {
    const env = resolveStartAuthEnv(baseEnv)

    expect(env.betterAuthUrl).toBe('http://localhost:3001')
    expect(env.betterAuthSecret).toBe(
      '12345678901234567890123456789012'
    )
  })

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

  it('uses stable Better Auth development defaults when local values are absent', () => {
    const env = resolveStartAuthEnv({
      ...baseEnv,
      BETTER_AUTH_SECRET: undefined,
      BETTER_AUTH_URL: undefined,
    })

    expect(env.betterAuthSecret).toBe(
      'start-better-auth-development-secret-do-not-use-in-production'
    )
    expect(env.betterAuthUrl).toBe('http://localhost:3000')
  })

  it('uses a stable development secret when the Better Auth secret is absent', () => {
    const env = resolveStartAuthEnv({
      ...baseEnv,
      BETTER_AUTH_SECRET: undefined,
    })

    expect(env.betterAuthSecret).toBe(
      'start-better-auth-development-secret-do-not-use-in-production'
    )
  })

  it('uses the registered legacy Zitadel callback path by default', () => {
    const env = resolveStartAuthEnv(baseEnv)

    expect(env.zitadelRedirectUri).toBe(
      'http://localhost:3000/api/auth/callback/zitadel'
    )
  })

  it('allows overriding the Zitadel redirect URI for deployments', () => {
    const env = resolveStartAuthEnv({
      ...baseEnv,
      ZITADEL_REDIRECT_URI:
        'https://map.example.org/api/auth/oauth2/callback/zitadel',
    })

    expect(env.zitadelRedirectUri).toBe(
      'https://map.example.org/api/auth/oauth2/callback/zitadel'
    )
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
      'http://localhost:3001',
    ])
  })

  it('throws a clear production error for missing Better Auth secret', () => {
    expect(() =>
      resolveStartAuthEnv({
        ...baseEnv,
        BETTER_AUTH_SECRET: '',
        NODE_ENV: 'production',
      })
    ).toThrow('Start Better Auth requires BETTER_AUTH_SECRET')
  })

  it('throws a clear production error for missing Better Auth URL', () => {
    expect(() =>
      resolveStartAuthEnv({
        ...baseEnv,
        BETTER_AUTH_URL: '',
        NODE_ENV: 'production',
      })
    ).toThrow('Start Better Auth requires BETTER_AUTH_URL')
  })
})
