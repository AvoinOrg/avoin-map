'use client'

import React, { type ReactNode } from 'react'

import {
  AUTH_PROVIDER_ID,
  AuthSessionProvider,
  getAuthSession,
  normalizeAuthSessionData,
  signInWithZitadel,
  signOutAuth,
  StaticAuthSessionProvider,
  useAuthSession,
  type AuthSession,
  type AuthSessionStatus,
} from '#/common/auth'

type CompatSessionInput = {
  expires?: string
  accessToken?: string
  error?: string
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export type SessionProviderProps = {
  children?: ReactNode
  session?: CompatSessionInput | null
}

export type UseSessionResult = {
  data: AuthSession | null
  status: AuthSessionStatus
  update: () => Promise<void>
}

const normalizeCompatSession = (
  session: CompatSessionInput | null | undefined
) => {
  if (!session) {
    return null
  }

  return normalizeAuthSessionData(
    {
      session: {
        id: 'next-auth-compat-session',
        userId: session.user?.id,
        expiresAt: session.expires,
      },
      user: session.user,
    },
    {
      accessToken: session.accessToken,
      error:
        session.error === 'RefreshAccessTokenError'
          ? 'RefreshAccessTokenError'
          : undefined,
    }
  )
}

export const SessionProvider = ({
  children,
  session,
}: SessionProviderProps) => {
  if (session !== undefined) {
    return (
      <StaticAuthSessionProvider session={normalizeCompatSession(session)}>
        {children}
      </StaticAuthSessionProvider>
    )
  }

  return <AuthSessionProvider>{children}</AuthSessionProvider>
}

export const useSession = (): UseSessionResult => {
  const authSession = useAuthSession()

  return {
    data: authSession.data,
    status: authSession.status,
    update: authSession.refetch,
  }
}

export const getSession = getAuthSession

export const signIn = (
  providerId?: string,
  options: { callbackUrl?: string; callbackURL?: string } = {}
) => {
  if (providerId && providerId !== AUTH_PROVIDER_ID) {
    console.warn(
      `[nextAuthReactCompat] Unsupported provider "${providerId}", using "${AUTH_PROVIDER_ID}".`
    )
  }

  return signInWithZitadel({
    callbackURL: options.callbackURL ?? options.callbackUrl,
  })
}

export const signOut = async (options: {
  callbackUrl?: string
  redirect?: boolean
} = {}) => {
  await signOutAuth()

  if (
    options.redirect !== false &&
    options.callbackUrl &&
    typeof window !== 'undefined'
  ) {
    window.location.assign(options.callbackUrl)
  }
}

