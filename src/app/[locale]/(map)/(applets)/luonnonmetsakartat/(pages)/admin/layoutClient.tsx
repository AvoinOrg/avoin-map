'use client'

import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

import { useUIStore } from '#/common/store/UIStore'
import { getRoute } from '#/common/utils/routing-client'
import { getPathnameWithoutLocale } from '#/common/utils/routing'

import { routeTree } from 'applets/luonnonmetsakartat/common/routes'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { adminVerificationQuery } from 'applets/luonnonmetsakartat/common/queries/adminVerificationQuery'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const setIsNavbarHidden = useUIStore((state) => state.setIsNavbarHidden)
  const isAdminVerified = useAppletStore((state) => state.isAdminVerified)
  const { data: session, status } = useSession()

  const router = useRouter()
  const pathname = usePathname()
  const { locale } = useParams()

  const localAdminVerificationQuery = useQuery({
    ...adminVerificationQuery(),
    enabled: false,
  })

  useEffect(() => {
    setIsNavbarHidden(false)

    return () => {
      setIsNavbarHidden(true)
    }
  }, [])

  useEffect(() => {
    if (status !== 'loading') {
      if (session?.user?.id != null) {
      }
    } else {
    }
  }, [session?.user?.id, status])

  useEffect(() => {
    if (!isAdminVerified) {
      const adminRoute = getRoute(routeTree.admin, routeTree)
      if (getPathnameWithoutLocale(pathname, locale) !== adminRoute) {
        router.replace(adminRoute)
      }
    }
  }, [isAdminVerified, pathname, router, locale])

  return <>{children}</>
}

export default layoutClient
