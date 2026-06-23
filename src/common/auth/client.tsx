'use client'

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createAuthClient } from 'better-auth/react'
import { genericOAuthClient } from 'better-auth/client/plugins'

import { AUTH_PROVIDER_ID, AUTH_REFRESH_ERROR } from './constants'
import {
  getAuthSessionStatus,
  normalizeAuthAccessTokenResult,
  normalizeAuthSessionData,
  type AuthAccessTokenApiResponse,
} from './normalize'
import type {
  AuthAccessTokenResult,
  AuthRefreshError,
  AuthSession,
  AuthSessionResult,
} from './types'
import { AuthSessionContext } from './sessionContext'

type AuthAccessTokenState =
  | {
      status: 'idle'
    }
  | {
      status: 'ready'
      accessTokenRequestKey: string
      result: AuthAccessTokenResult
    }

type SignInWithZitadelOptions = {
  callbackURL?: string
  errorCallbackURL?: string
  newUserCallbackURL?: string
  scopes?: string[]
}

const IDLE_ACCESS_TOKEN_STATE: AuthAccessTokenState = { status: 'idle' }

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [genericOAuthClient()],
})

const getSessionRequestKey = (session: AuthSession | null) => {
  if (!session) {
    return null
  }

  return [
    session.session.id,
    session.session.userId,
    session.session.expiresAt?.toISOString(),
    session.user.id,
  ].join(':')
}

const getTokenFields = (
  accessTokenState: AuthAccessTokenState,
  accessTokenRequestKey: string | null
):
  | {
      accessToken?: string
      accessTokenExpiresAt?: Date | null
      error?: AuthRefreshError
    }
  | undefined => {
  if (
    !accessTokenRequestKey ||
    accessTokenState.status !== 'ready' ||
    accessTokenState.accessTokenRequestKey !== accessTokenRequestKey
  ) {
    return undefined
  }

  if (accessTokenState.result.ok) {
    return {
      accessToken: accessTokenState.result.accessToken,
      accessTokenExpiresAt: accessTokenState.result.accessTokenExpiresAt,
    }
  }

  if (accessTokenState.result.error === AUTH_REFRESH_ERROR) {
    return {
      error: AUTH_REFRESH_ERROR,
    }
  }

  return undefined
}

const isAccessTokenReadyForRequest = (
  accessTokenState: AuthAccessTokenState,
  accessTokenRequestKey: string | null
) =>
  Boolean(accessTokenRequestKey) &&
  accessTokenState.status === 'ready' &&
  accessTokenState.accessTokenRequestKey === accessTokenRequestKey

const notifyAuthSessionChanged = () => {
  authClient.$store.notify('$sessionSignal')
}

const toAbsoluteClientUrl = (value: string | undefined) => {
  if (!value || typeof window === 'undefined') {
    return value
  }

  return new URL(value, window.location.origin).toString()
}

export const getAuthAccessToken =
  async (): Promise<AuthAccessTokenResult> => {
    try {
      const result = await authClient.getAccessToken({
        providerId: AUTH_PROVIDER_ID,
      })

      return normalizeAuthAccessTokenResult(
        result as AuthAccessTokenApiResponse
      )
    } catch {
      return {
        ok: false,
        accessToken: null,
        accessTokenExpiresAt: null,
        scopes: [],
        error: AUTH_REFRESH_ERROR,
      }
    }
  }

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const result = await authClient.getSession()

  if (result.error || !result.data) {
    return null
  }

  const accessToken = await getAuthAccessToken()

  return normalizeAuthSessionData(
    result.data,
    accessToken.ok
      ? {
          accessToken: accessToken.accessToken,
          accessTokenExpiresAt: accessToken.accessTokenExpiresAt,
        }
      : accessToken.error === AUTH_REFRESH_ERROR
        ? { error: AUTH_REFRESH_ERROR }
        : undefined
  )
}

export const signInWithZitadel = (options: SignInWithZitadelOptions = {}) =>
  authClient.signIn.oauth2({
    providerId: AUTH_PROVIDER_ID,
    ...options,
    callbackURL: toAbsoluteClientUrl(options.callbackURL),
    errorCallbackURL: toAbsoluteClientUrl(options.errorCallbackURL),
    newUserCallbackURL: toAbsoluteClientUrl(options.newUserCallbackURL),
  })

export const signOutAuth = async () => {
  try {
    return await authClient.signOut()
  } finally {
    notifyAuthSessionChanged()
  }
}

const useLiveAuthSessionValue = (): AuthSessionResult => {
  const sessionQuery = authClient.useSession()
  const session = useMemo(
    () => normalizeAuthSessionData(sessionQuery.data),
    [sessionQuery.data]
  )
  const sessionRequestKey = getSessionRequestKey(session)
  const [tokenRefreshNonce, setTokenRefreshNonce] = useState(0)
  const [accessTokenState, setAccessTokenState] =
    useState<AuthAccessTokenState>(IDLE_ACCESS_TOKEN_STATE)
  const requestIdRef = useRef(0)
  const accessTokenRequestKey = sessionRequestKey
    ? `${sessionRequestKey}:${tokenRefreshNonce}`
    : null

  useEffect(() => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current
    let isActive = true

    if (sessionQuery.isPending || !accessTokenRequestKey) {
      return
    }

    void getAuthAccessToken().then((result) => {
      if (!isActive || requestIdRef.current !== requestId) {
        return
      }

      setAccessTokenState({ status: 'ready', accessTokenRequestKey, result })
    })

    return () => {
      isActive = false
    }
  }, [accessTokenRequestKey, sessionQuery.isPending])

  const isCurrentAccessTokenReady = isAccessTokenReadyForRequest(
    accessTokenState,
    accessTokenRequestKey
  )
  const isCurrentAccessTokenLoading =
    Boolean(sessionRequestKey) &&
    !sessionQuery.isPending &&
    !isCurrentAccessTokenReady
  const tokenFields = getTokenFields(accessTokenState, accessTokenRequestKey)
  const data = useMemo(
    () =>
      sessionRequestKey && isCurrentAccessTokenReady
        ? normalizeAuthSessionData(sessionQuery.data, tokenFields)
        : null,
    [isCurrentAccessTokenReady, sessionQuery.data, sessionRequestKey, tokenFields]
  )
  const status = getAuthSessionStatus({
    hasSession: Boolean(session),
    isSessionPending: sessionQuery.isPending,
    isAccessTokenLoading: isCurrentAccessTokenLoading,
  })
  const refetch = async () => {
    await sessionQuery.refetch()
    setTokenRefreshNonce((nonce) => nonce + 1)
  }

  return {
    data,
    status,
    error: sessionQuery.error,
    isLoading: status === 'loading',
    isRefetching: sessionQuery.isRefetching,
    isAccessTokenLoading: isCurrentAccessTokenLoading,
    refetch,
  }
}

export const AuthSessionProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const value = useLiveAuthSessionValue()

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  )
}
