'use client'

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'

import type { AuthSession, AuthSessionResult } from './types'

export const AuthSessionContext = createContext<AuthSessionResult | null>(null)

export const StaticAuthSessionProvider = ({
  children,
  session,
}: {
  children: ReactNode
  session: AuthSession | null
}) => {
  const value = useMemo<AuthSessionResult>(
    () => ({
      data: session,
      status: session ? 'authenticated' : 'unauthenticated',
      error: null,
      isLoading: false,
      isRefetching: false,
      isAccessTokenLoading: false,
      refetch: async () => undefined,
    }),
    [session]
  )

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export const useAuthSession = () => {
  const value = useContext(AuthSessionContext)

  if (!value) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider')
  }

  return value
}
