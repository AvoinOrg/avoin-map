import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { signIn } from 'next-auth/react'

const LoginRoute = () => {
  const { locale } = Route.useParams()

  useEffect(() => {
    void signIn('zitadel', {
      callbackUrl: `/${locale}/adds/login/callback`,
    })
  }, [locale])

  return null
}

export const Route = createFileRoute('/$locale/adds/login/')({
  component: LoginRoute,
})
