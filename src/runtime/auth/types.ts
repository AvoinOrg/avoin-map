import { AUTH_PROVIDER_ID, AUTH_REFRESH_ERROR } from '#/common/auth/constants'

export const START_AUTH_PROVIDER_ID = AUTH_PROVIDER_ID
export const START_AUTH_REFRESH_ERROR = AUTH_REFRESH_ERROR

export type StartAuthRefreshError = typeof START_AUTH_REFRESH_ERROR

export type StartAuthEnv = {
  betterAuthSecret: string
  betterAuthUrl: string
  trustedOrigins: string[]
  zitadelIssuer: string
  zitadelClientId: string
  zitadelClientSecret: string
  zitadelRedirectUri: string
  isProduction: boolean
}

export type StartAuthUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  loginName: string | null
}

export type StartAuthSession = {
  session: {
    id: string
    userId: string
    expiresAt: Date
  }
  user: StartAuthUser
}

export type StartAccessTokenError =
  | 'NoSession'
  | 'NoAccessToken'
  | StartAuthRefreshError

export type StartAccessTokenResult =
  | {
      ok: true
      accessToken: string
      accessTokenExpiresAt: Date | null
      scopes: string[]
      responseHeaders: Headers
      error?: undefined
    }
  | {
      ok: false
      accessToken: null
      accessTokenExpiresAt: null
      scopes: []
      responseHeaders: Headers | null
      error: StartAccessTokenError
    }
