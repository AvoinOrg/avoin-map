import type { AUTH_REFRESH_ERROR } from './constants'

export type AuthSessionStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

export type AuthRefreshError = typeof AUTH_REFRESH_ERROR

export type AuthAccessTokenError =
  | 'NoSession'
  | 'NoAccessToken'
  | AuthRefreshError

export type AuthUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  loginName?: string | null
}

export type AuthSession = {
  session: {
    id: string | null
    userId: string | null
    expiresAt: Date | null
  }
  user: AuthUser
  accessToken?: string
  accessTokenExpiresAt?: Date | null
  error?: AuthRefreshError
}

export type AuthUserInfo = {
  id?: string
  sub?: string
  name?: string
  email?: string
  image?: string
  picture?: string
  [key: string]: unknown
}

export type AuthAccessTokenResult =
  | {
      ok: true
      accessToken: string
      accessTokenExpiresAt: Date | null
      scopes: string[]
      error?: undefined
    }
  | {
      ok: false
      accessToken: null
      accessTokenExpiresAt: null
      scopes: []
      error: AuthAccessTokenError
    }

export type AuthSessionResult = {
  data: AuthSession | null
  status: AuthSessionStatus
  error: Error | string | null
  isLoading: boolean
  isRefetching: boolean
  isAccessTokenLoading: boolean
  refetch: () => Promise<void>
}

