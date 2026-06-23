'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

import { signInWithZitadel } from '#/common/auth'
import { getLoginCallbackUrl } from '#/common/utils/auth'

const Login = () => {
  const params = useParams<{ locale?: string | string[] }>()
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale

  useEffect(() => {
    void signInWithZitadel({
      callbackURL: getLoginCallbackUrl(locale),
    })
  }, [locale])

  return null
}

export default Login
