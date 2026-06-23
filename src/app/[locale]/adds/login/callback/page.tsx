'use client'

import { useEffect } from 'react'

import { useAuthSession } from '#/common/auth'

const CallbackPage = () => {
  const { status } = useAuthSession()

  useEffect(() => {
    if (status === 'authenticated' && typeof window !== 'undefined') {
      window.close()
    }
  }, [status])

  return null
}

export default CallbackPage
