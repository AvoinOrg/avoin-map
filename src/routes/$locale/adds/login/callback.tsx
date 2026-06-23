import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const LoginCallbackRoute = () => {
  const { status } = useSession()

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
