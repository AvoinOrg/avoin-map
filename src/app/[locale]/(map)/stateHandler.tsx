/**
 * @file For global state handling that cannot be done in layoutClient.tsx
 */

'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '#/common/store/userStore'

const StateHandler = ({ children }: { children?: React.ReactNode }) => {
  const { data: session } = useSession()
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    if (session?.user?.id) {
      setUser({ ...session.user, accessToken: session.accessToken })
    } else {
      setUser(null)
    }
  }, [session])

  return <>{children}</>
}

export default StateHandler
