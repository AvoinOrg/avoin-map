import { AUTH_REFRESH_ERROR } from './constants'
import type {
  AuthAccessTokenResult,
  AuthRefreshError,
  AuthSession,
  AuthSessionStatus,
  AuthUser,
} from './types'

type AuthSessionTokenFields = {
  accessToken?: string
  accessTokenExpiresAt?: Date | null
  error?: AuthRefreshError
}

export type AuthAccessTokenApiResponse = {
  data: {
    accessToken?: unknown
    accessTokenExpiresAt?: unknown
    scopes?: unknown
  } | null
  error: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const optionalString = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : null

const toOptionalDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return null
}

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []

export const normalizeAuthUser = (value: unknown): AuthUser | null => {
  if (!isRecord(value)) {
    return null
  }

  const id = optionalString(value.id)

  if (!id) {
    return null
  }

  return {
    id,
    name: optionalString(value.name),
    email: optionalString(value.email),
    image: optionalString(value.image),
    loginName: optionalString(value.loginName),
  }
}

export const normalizeAuthSessionData = (
  value: unknown,
  tokenFields: AuthSessionTokenFields = {}
): AuthSession | null => {
  if (!isRecord(value)) {
    return null
  }

  const user = normalizeAuthUser(value.user)

  if (!user) {
    return null
  }

  const rawSession = isRecord(value.session) ? value.session : {}

  return {
    session: {
      id: optionalString(rawSession.id),
      userId: optionalString(rawSession.userId),
      expiresAt: toOptionalDate(rawSession.expiresAt),
    },
    user,
    ...tokenFields,
  }
}

export const normalizeAuthAccessTokenResult = (
  result: AuthAccessTokenApiResponse
): AuthAccessTokenResult => {
  if (result.error) {
    return {
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      error: AUTH_REFRESH_ERROR,
    }
  }

  const accessToken = optionalString(result.data?.accessToken)

  if (!accessToken) {
    return {
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      error: 'NoAccessToken',
    }
  }

  return {
    ok: true,
    accessToken,
    accessTokenExpiresAt: toOptionalDate(result.data?.accessTokenExpiresAt),
    scopes: toStringArray(result.data?.scopes),
  }
}

export const getAuthSessionStatus = ({
  hasSession,
  isSessionPending,
  isAccessTokenLoading,
}: {
  hasSession: boolean
  isSessionPending: boolean
  isAccessTokenLoading: boolean
}): AuthSessionStatus => {
  if (isSessionPending || (hasSession && isAccessTokenLoading)) {
    return 'loading'
  }

  return hasSession ? 'authenticated' : 'unauthenticated'
}

