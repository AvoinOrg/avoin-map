import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { signInWithZitadel } from '#/common/auth'
import { getLoginCallbackUrl } from '#/common/utils/auth'

const LoginRoute = () => {
  const { locale } = Route.useParams()

  useEffect(() => {
    void signInWithZitadel({
      callbackURL: getLoginCallbackUrl(locale),
    })
  }, [locale])

  return null
}

export const Route = createFileRoute('/$locale/adds/login/')({
  component: LoginRoute,
})
