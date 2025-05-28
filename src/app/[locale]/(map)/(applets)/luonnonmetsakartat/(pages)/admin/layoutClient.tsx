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
import { Sidebar, SidebarContentBox } from '#/components/Sidebar'
import { Box, Typography } from '@mui/material'
import { Star } from '#/components/icons'
import { T } from '@tolgee/react'
import { AdminVerificationStatus } from 'applets/luonnonmetsakartat/common/types'
import LoadingBlocker from 'applets/luonnonmetsakartat/components/LoadingBlocker'

enum LocalState {
  Loading = 'loading',
  Verified = 'verified',
  Rejected = 'rejected',
  Errored = 'errored',
  NoUser = 'noUser',
}

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const setIsNavbarHidden = useUIStore((state) => state.setIsNavbarHidden)
  const adminVerificationStatus = useAppletStore(
    (state) => state.adminVerificationStatus
  )
  const setAdminVerificationStatus = useAppletStore(
    (state) => state.setAdminVerificationStatus
  )
  const { data: session, status } = useSession()
  const [localState, setLocalState] = useState<LocalState>(LocalState.Loading)

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
  }, [session?.user?.id, status])

  useEffect(() => {
    if (status === 'authenticated') {
      if (adminVerificationStatus === AdminVerificationStatus.NoUser) {
        setLocalState(LocalState.Loading)
      } else if (adminVerificationStatus === AdminVerificationStatus.Pending) {
        setLocalState(LocalState.Loading)
      } else if (adminVerificationStatus === AdminVerificationStatus.Verified) {
        setLocalState(LocalState.Verified)
      } else if (adminVerificationStatus === AdminVerificationStatus.Rejected) {
        setLocalState(LocalState.Rejected)
      } else if (adminVerificationStatus === AdminVerificationStatus.Errored) {
        setLocalState(LocalState.Errored)
      }
    } else if (status === 'unauthenticated') {
      setLocalState(LocalState.NoUser)
    } else if (status === 'loading') {
      setLocalState(LocalState.Loading)
    }
  }, [session, status, adminVerificationStatus])

  // returns the user back to admin page, if they try to navigate
  // further without being verified
  useEffect(() => {
    if (localState === LocalState.Rejected) {
      const adminRoute = getRoute({
        routeNode: routeTree.admin,
        routeTree: routeTree,
      })
      if (getPathnameWithoutLocale(pathname, locale) !== adminRoute) {
        router.replace(adminRoute)
      }
    }
  }, [localState, pathname, router, locale, status])

  return (
    <>
      {localState !== LocalState.Verified && (
        <>
          {localState === LocalState.Loading && (
            <LoadingBlocker></LoadingBlocker>
          )}
          {localState === LocalState.NoUser && (
            <SidebarContentBox>
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
            </SidebarContentBox>
          )}
          {localState === LocalState.Errored && (
            <SidebarContentBox>
              <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                {/* <Star sx={{ height: 40, width: 'auto' }}></Star> */}
                <Typography
                  sx={{
                    display: 'inline-flex',
                    typography: 'body2',
                    mt: 0.5,
                  }}
                >
                  <T
                    keyName={'sidebar.admin.verification_errored'}
                    ns="luonnonmetsakartat"
                  ></T>
                </Typography>
              </Box>
            </SidebarContentBox>
          )}
          {localState === LocalState.Rejected && (
            <SidebarContentBox>
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
            </SidebarContentBox>
          )}
        </>
      )}
      {localState === LocalState.Verified && children}
    </>
  )
}

export default layoutClient
