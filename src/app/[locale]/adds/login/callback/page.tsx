'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function CallbackPage() {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && typeof window !== 'undefined') {
      window.close()
    }
  }, [status])

  return null
}
