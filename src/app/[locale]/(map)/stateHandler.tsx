/**
 * @file For global state handling that cannot be done in layoutClient.tsx
 */

'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '#/common/store/userStore'
import { useQuery } from '@tanstack/react-query'
import { User } from 'next-auth'
import { set } from 'ol/transform'
import { UserAuthState, UserDataState } from '#/common/types/state'

const StateHandler = ({ children }: { children?: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const setUserAuth = useUserStore((state) => state.setUserAuth)
  const setUserData = useUserStore((state) => state.setUserData)
  const setUserAuthState = useUserStore((state) => state.setUserAuthState)
  const setUserDataState = useUserStore((state) => state.setUserDataState)
  const signOut = useUserStore((state) => state.signOut)

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User>({
    queryKey: ['userinfo'],
    queryFn: async () => {
      const response = await fetch('/api/userinfo')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    enabled: false,
  })

  useEffect(() => {
    if (error) {
      signOut()
    }
  }, [error])

  useEffect(() => {
    if (user) {
      setUserData(user)
    } else {
      setUserData(null)
    }
  }, [user])

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      console.log('Session expired - signing out')
      // Force a clean sign-out
      setUserAuth(null)
      setUserData(null)
      signOut()
    }
    if (session?.user?.id) {
      setUserAuth({ id: session.user.id, accessToken: session.accessToken })
    } else {
      setUserAuth(null)
      setUserData(null)
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      setUserAuth(null)
      setUserData(null)
      setUserAuthState(UserAuthState.Unauthenticated)
      setUserDataState(UserDataState.Unfetched)
    } else if (status === 'loading') {
      setUserAuthState(UserAuthState.Loading)
      setUserDataState(UserDataState.Unfetched)
      setUserAuth(null)
      setUserData(null)
    } else if (status === 'authenticated') {
      setUserAuthState(UserAuthState.Authenticated)
      if (!user) {
        setUserData(null)
        setUserDataState(UserDataState.Fetching)
        refetch()
      } else if (user) {
        setUserData(user)
        setUserDataState(UserDataState.Fetched)
      }
    }
  }, [status, user])

  return <>{children}</>
}

export default StateHandler
