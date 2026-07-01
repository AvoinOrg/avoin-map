'use client'

import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuthSession } from '#/common/auth'
import { useUIStore } from '#/common/store/uiStore'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'
import { useAppRouteHrefBuilder } from '#/common/navigation/appRouteLinks'
import {
  useAppPathname,
  useAppRouter,
} from '#/common/navigation/navigation'

import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useAdminVerificationQueryOptions } from 'applets/luonnonmetsakartat/common/queries/adminVerificationQuery'
import { SidebarContentBox } from '#/components/Sidebar'
import { Box } from '#/common/style/theme'
import { Star } from '#/components/icons'
import TText from '#/components/common/TText'
import { AdminVerificationStatus } from 'applets/luonnonmetsakartat/common/types'
import LoadingBlocker from 'applets/luonnonmetsakartat/components/LoadingBlocker'
import { useLuonnonmetsakartatMockScenarioQueryState } from 'applets/luonnonmetsakartat/common/mockScenarios/queryState'

enum LocalState {
  Loading = 'loading',
  Verified = 'verified',
  Rejected = 'rejected',
  Errored = 'errored',
  NoUser = 'noUser',
}

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  useExclusiveLayerGroups()
  const setIsNavbarHidden = useUIStore((state) => state.setIsNavbarHidden)
  const adminVerificationStatus = useAppletStore(
    (state) => state.adminVerificationStatus
  )
  const setAdminVerificationStatus = useAppletStore(
    (state) => state.setAdminVerificationStatus
  )
  const { data: session, status } = useAuthSession()
  const { accessToken } = session ?? {}
  const mockScenarioState = useLuonnonmetsakartatMockScenarioQueryState()
  const isMockScenarioQueryActive = mockScenarioState != null

  const router = useAppRouter()
  const buildAppRouteHref = useAppRouteHrefBuilder()
  const pathname = useAppPathname()

  const { refetch: refetchAdminVerification } = useQuery({
    ...useAdminVerificationQueryOptions(),
    enabled: false,
  })

  useEffect(() => {
    setIsNavbarHidden(false)

    return () => {
      setIsNavbarHidden(true)
    }
  }, [setIsNavbarHidden])

  useEffect(() => {
    if (isMockScenarioQueryActive) {
      return
    }

    if (status !== 'authenticated' || session?.user?.id == null) {
      return
    }

    if (!accessToken) {
      setAdminVerificationStatus(AdminVerificationStatus.Errored)
      return
    }

    refetchAdminVerification()
  }, [
    accessToken,
    session?.user?.id,
    status,
    isMockScenarioQueryActive,
    refetchAdminVerification,
    setAdminVerificationStatus,
  ])

  const localState = React.useMemo(() => {
    if (status === 'authenticated') {
      if (adminVerificationStatus === AdminVerificationStatus.NoUser) {
        return LocalState.Loading
      } else if (adminVerificationStatus === AdminVerificationStatus.Pending) {
        return LocalState.Loading
      } else if (adminVerificationStatus === AdminVerificationStatus.Verified) {
        return LocalState.Verified
      } else if (adminVerificationStatus === AdminVerificationStatus.Rejected) {
        return LocalState.Rejected
      } else if (adminVerificationStatus === AdminVerificationStatus.Errored) {
        return LocalState.Errored
      }
    } else if (status === 'unauthenticated') {
      return LocalState.NoUser
    }

    return LocalState.Loading
  }, [status, adminVerificationStatus])

  // returns the user back to admin page, if they try to navigate
  // further without being verified
  useEffect(() => {
    if (localState === LocalState.Rejected) {
      const adminRoute = buildAppRouteHref({
        routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN,
      })
      if (pathname !== adminRoute) {
        router.replace(adminRoute, { locale: false })
      }
    }
  }, [buildAppRouteHref, localState, pathname, router, status])

  return (
    <>
      {localState !== LocalState.Verified && (
        <>
          {localState === LocalState.Loading && (
            <LoadingBlocker></LoadingBlocker>
          )}
          {localState === LocalState.NoUser && (
            <SidebarContentBox>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  mt: 3,
                  alignItems: 'start',
                }}
              >
                <Star
                  sx={{ height: 40, width: 'auto', flexShrink: 0, mt: 0.5 }}
                ></Star>
                <Box
                  component="p"
                  sx={{
                    display: 'inline-flex',
                    typography: 'body2',
                    m: 0,
                    ml: 1.5,
                    mt: 0.5,
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.log_in_hint'}
                    ns="luonnonmetsakartat"
                  />
                </Box>
              </Box>
            </SidebarContentBox>
          )}
          {localState === LocalState.Errored && (
            <SidebarContentBox>
              <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                {/* <Star sx={{ height: 40, width: 'auto' }}></Star> */}
                <Box
                  component="p"
                  sx={{
                    display: 'inline-flex',
                    typography: 'body2',
                    m: 0,
                    mt: 0.5,
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.verification_errored'}
                    ns="luonnonmetsakartat"
                  />
                </Box>
              </Box>
            </SidebarContentBox>
          )}
          {localState === LocalState.Rejected && (
            <SidebarContentBox>
              <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                {/* <Star sx={{ height: 40, width: 'auto' }}></Star> */}
                <Box
                  component="p"
                  sx={{
                    display: 'inline-flex',
                    typography: 'body2',
                    m: 0,
                    ml: 1.5,
                    mt: 0.5,
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.verification_rejected'}
                    ns="luonnonmetsakartat"
                  />
                </Box>
              </Box>
            </SidebarContentBox>
          )}
        </>
      )}
      {localState === LocalState.Verified && children}
    </>
  )
}

export default LayoutClient
