import { describe, expect, it } from '@jest/globals'

import {
  buildZitadelOAuthProvider,
  mapZitadelProfileToUser,
  normalizeZitadelProfile,
} from './zitadel'

describe('Zitadel Better Auth config', () => {
  it('uses normalized OIDC discovery and permits Zitadel callbacks without RFC 9207 issuer parameters', () => {
    const provider = buildZitadelOAuthProvider({
      zitadelIssuer: 'https://auth.example.org///',
      zitadelClientId: 'client-id',
      zitadelClientSecret: 'client-secret',
      zitadelProjectId: 'synthetic-project-id',
      zitadelRedirectUri:
        'https://map.example.org/api/auth/callback/zitadel',
    })

    expect(provider).toMatchObject({
      providerId: 'zitadel',
      discoveryUrl: 'https://auth.example.org/.well-known/openid-configuration',
      issuer: 'https://auth.example.org',
      requireIssuerValidation: false,
      clientId: 'client-id',
      clientSecret: 'client-secret',
      redirectURI: 'https://map.example.org/api/auth/callback/zitadel',
      scopes: [
        'openid',
        'email',
        'profile',
        'offline_access',
        'urn:zitadel:iam:org:project:roles',
        'urn:zitadel:iam:org:project:id:synthetic-project-id:aud',
      ],
      pkce: true,
      authentication: 'basic',
    })
  })

  it('normalizes the fields current auth consumers expect', () => {
    const user = normalizeZitadelProfile({
      sub: 'user-id',
      name: 'Ada Lovelace',
      email: 'ada@example.org',
      picture: 'https://example.org/ada.png',
      preferred_username: 'ada@example.org',
    })

    expect(user).toEqual({
      id: 'user-id',
      name: 'Ada Lovelace',
      email: 'ada@example.org',
      image: 'https://example.org/ada.png',
      loginName: 'ada@example.org',
    })
  })

  it('maps profile data into Better Auth user fields including login name', () => {
    const user = mapZitadelProfileToUser({
      sub: 'user-id',
      name: 'Ada Lovelace',
      email: 'ada@example.org',
      email_verified: true,
      picture: 'https://example.org/ada.png',
      preferred_username: 'ada@example.org',
      given_name: 'Ada',
      family_name: 'Lovelace',
    })

    expect(user).toMatchObject({
      id: 'user-id',
      name: 'Ada Lovelace',
      email: 'ada@example.org',
      emailVerified: true,
      image: 'https://example.org/ada.png',
      loginName: 'ada@example.org',
      firstName: 'Ada',
      lastName: 'Lovelace',
    })
  })
})
