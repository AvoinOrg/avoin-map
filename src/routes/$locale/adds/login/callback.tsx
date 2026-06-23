import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useAuthSession } from '#/common/auth'

const LoginCallbackRoute = () => {
  const { status } = useAuthSession()

  useEffect(() => {
    if (status === 'authenticated' && typeof window !== 'undefined') {
      window.close()
    }
  }, [status])

  return null
}

export const Route = createFileRoute('/$locale/adds/login/callback')({
  component: LoginCallbackRoute,
})
