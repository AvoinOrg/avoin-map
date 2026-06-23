import type { GenericOAuthConfig } from 'better-auth/plugins'

import {
  START_AUTH_PROVIDER_ID,
  type StartAuthEnv,
  type StartAuthUser,
} from './types'

export type ZitadelProfile = {
  sub?: unknown
  name?: unknown
  email?: unknown
  email_verified?: unknown
  picture?: unknown
  preferred_username?: unknown
  given_name?: unknown
  family_name?: unknown
}

export const ZITADEL_OIDC_SCOPES = [
  'openid',
  'email',
  'profile',
  'offline_access',
] as const

const optionalString = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : null

export const normalizeZitadelProfile = (
  profile: ZitadelProfile
): StartAuthUser => ({
  id: optionalString(profile.sub) ?? '',
  name: optionalString(profile.name),
  email: optionalString(profile.email),
  image: optionalString(profile.picture),
  loginName: optionalString(profile.preferred_username),
})

export const mapZitadelProfileToUser = (profile: ZitadelProfile) => {
  const user = normalizeZitadelProfile(profile)

  return {
    id: user.id,
    name: user.name ?? user.loginName ?? user.email ?? '',
    email: user.email ?? '',
    emailVerified: profile.email_verified === true,
    image: user.image,
    loginName: user.loginName,
    firstName: optionalString(profile.given_name),
    lastName: optionalString(profile.family_name),
  }
}

export const buildZitadelOAuthProvider = (
  env: Pick<
    StartAuthEnv,
    'zitadelIssuer' | 'zitadelClientId' | 'zitadelClientSecret'
  >
): GenericOAuthConfig => ({
  providerId: START_AUTH_PROVIDER_ID,
  discoveryUrl: `${env.zitadelIssuer}/.well-known/openid-configuration`,
  issuer: env.zitadelIssuer,
  requireIssuerValidation: true,
  clientId: env.zitadelClientId,
  clientSecret: env.zitadelClientSecret,
  scopes: [...ZITADEL_OIDC_SCOPES],
  pkce: true,
  authentication: 'basic',
  mapProfileToUser: mapZitadelProfileToUser,
})
