/**
 * @file For global user state handling
 */

import React, { useEffect } from 'react'
import axios from 'axios'
import { useUserStore } from '#/common/store/userStore'
import { useQuery } from '@tanstack/react-query'

import {
  AUTH_REFRESH_ERROR,
  useAuthSession,
  type AuthUserInfo,
} from '#/common/auth'
import { UserAuthState, UserDataState } from '#/common/types/state'

const UserStateHandler = ({ children }: { children?: React.ReactNode }) => {
  const { data: session, status } = useAuthSession()
  const setUserAuth = useUserStore((state) => state.setUserAuth)
  const setUserData = useUserStore((state) => state.setUserData)
  const setUserAuthState = useUserStore((state) => state.setUserAuthState)
  const setUserDataState = useUserStore((state) => state.setUserDataState)
  const signOut = useUserStore((state) => state.signOut)
  const sessionUserId = session?.user?.id ?? null
  const sessionError = session?.error

  const {
    data: user,
    error,
    isFetching,
    isLoading,
  } = useQuery<AuthUserInfo>({
    queryKey: ['userinfo', sessionUserId],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/userinfo')
        return response.data
      } catch (axiosError) {
        console.error('Error fetching userinfo with axios:', axiosError)
        throw new Error('Network response was not ok')
      }
    },
    enabled:
      status === 'authenticated' &&
      Boolean(sessionUserId) &&
      sessionError !== AUTH_REFRESH_ERROR,
    retry: false,
  })

  useEffect(() => {
    if (error) {
      signOut()
    }
  }, [error, signOut])

  useEffect(() => {
    if (status === 'authenticated' && user) {
      setUserData(user)
    } else {
      setUserData(null)
    }
  }, [setUserData, status, user])

  useEffect(() => {
    if (sessionError === AUTH_REFRESH_ERROR) {
      console.debug('Session expired - signing out')
      setUserAuth(null)
      setUserData(null)
      signOut()
      return
    }

    if (status === 'authenticated' && sessionUserId) {
      setUserAuth({ id: sessionUserId, accessToken: session?.accessToken })
    } else {
      setUserAuth(null)
      setUserData(null)
    }
  }, [
    session?.accessToken,
    sessionError,
    sessionUserId,
    setUserAuth,
    setUserData,
    signOut,
    status,
  ])

  useEffect(() => {
    if (sessionError === AUTH_REFRESH_ERROR) {
      return
    }

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

      if (!sessionUserId) {
        setUserData(null)
        setUserDataState(UserDataState.Unfetched)
      } else if (user) {
        setUserData(user)
        setUserDataState(UserDataState.Fetched)
      } else if (isLoading || isFetching) {
        setUserData(null)
        setUserDataState(UserDataState.Fetching)
      } else {
        setUserData(null)
        setUserDataState(UserDataState.Fetching)
      }
    }
  }, [
    isFetching,
    isLoading,
    sessionError,
    sessionUserId,
    setUserAuth,
    setUserAuthState,
    setUserData,
    setUserDataState,
    status,
    user,
  ])

  return <>{children}</>
}

export default UserStateHandler
