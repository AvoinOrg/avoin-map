'use client'

import React, { useEffect, useState } from 'react'
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
import { SidebarContentBox } from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'
import { Box, Typography } from '@mui/material'
import { Star } from '#/components/icons'
import { T } from '@tolgee/react'
import { AdminVerificationStatus } from 'applets/luonnonmetsakartat/common/types'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const setIsNavbarHidden = useUIStore((state) => state.setIsNavbarHidden)
  const adminVerificationStatus = useAppletStore(
    (state) => state.adminVerificationStatus
  )
  const { data: session, status } = useSession()
  const [isReady, setIsReady] = useState(false)

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
        localAdminVerificationQuery.refetch()
      }
    }
  }, [session?.user?.id, status, localAdminVerificationQuery.data])

  useEffect(() => {
    if (adminVerificationStatus === AdminVerificationStatus.Verified) {
      setIsReady(true)
    } else {
      setIsReady(false)
    }
  }, [adminVerificationStatus])

  // returns the user back to admin page, if they try to navigate
  // further without being verified
  useEffect(() => {
    if (adminVerificationStatus !== AdminVerificationStatus.Verified) {
      const adminRoute = getRoute(routeTree.admin, routeTree)
      if (getPathnameWithoutLocale(pathname, locale) !== adminRoute) {
        router.replace(adminRoute)
      }
    }
  }, [adminVerificationStatus, pathname, router, locale])

  return (
    <SidebarContentBox>
      {(status === 'loading' ||
        adminVerificationStatus === AdminVerificationStatus.Pending) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <LoadingSpinner />
        </Box>
      )}
      {status !== 'loading' && session?.user?.id == null && (
        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
          <Star sx={{ height: 40, width: 'auto' }}></Star>
          <Typography
            sx={{
              display: 'inline-flex',
              typography: 'body2',
              ml: 1.5,
              mt: 0.5,
            }}
          >
            <T
              keyName={'sidebar.admin.log_in_hint'}
              ns="luonnonmetsakartat"
            ></T>
          </Typography>
        </Box>
      )}
      {adminVerificationStatus === AdminVerificationStatus.Errored && (
        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
          {/* <Star sx={{ height: 40, width: 'auto' }}></Star> */}
          <Typography
            sx={{
              display: 'inline-flex',
              typography: 'body2',
              ml: 1.5,
              mt: 0.5,
            }}
          >
            <T
              keyName={'sidebar.admin.verification_errored'}
              ns="luonnonmetsakartat"
            ></T>
          </Typography>
        </Box>
      )}
      {adminVerificationStatus === AdminVerificationStatus.Errored && (
        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
          {/* <Star sx={{ height: 40, width: 'auto' }}></Star> */}
          <Typography
            sx={{
              display: 'inline-flex',
              typography: 'body2',
              ml: 1.5,
              mt: 0.5,
            }}
          >
            <T
              keyName={'sidebar.admin.verification_errored'}
              ns="luonnonmetsakartat"
            ></T>
          </Typography>
        </Box>
      )}
      {adminVerificationStatus === AdminVerificationStatus.Rejected && (
        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
          {/* <Star sx={{ height: 40, width: 'auto' }}></Star> */}
          <Typography
            sx={{
              display: 'inline-flex',
              typography: 'body2',
              ml: 1.5,
              mt: 0.5,
            }}
          >
            <T
              keyName={'sidebar.admin.verification_rejected'}
              ns="luonnonmetsakartat"
            ></T>
          </Typography>
        </Box>
      )}
      {isReady && children}
    </SidebarContentBox>
  )
}

export default layoutClient
