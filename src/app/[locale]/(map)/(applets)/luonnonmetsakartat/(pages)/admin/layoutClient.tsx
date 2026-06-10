'use client'

import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

import { useUIStore } from '#/common/store/uiStore'
import { getRoute } from '#/common/routing/routing-client'
import { getPathnameWithoutLocale } from '#/common/routing/routing'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'

import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { adminVerificationQuery } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/queries/adminVerificationQuery'
import { SidebarContentBox } from '#/components/Sidebar'
import { Box } from '#/components/common/PandaBox'
import { Star } from '#/components/icons'
import TText from '#/components/common/TText'
import { AdminVerificationStatus } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import LoadingBlocker from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/LoadingBlocker'

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
  const { data: session, status } = useSession()

  const router = useRouter()
  const pathname = usePathname()
  const { locale } = useParams()
  const normalizedLocale =
    typeof locale === 'string' || Array.isArray(locale) ? locale : null

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

  const localState = (() => {
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
    } else if (status === 'loading') {
      return LocalState.Loading
    }
    return LocalState.Loading
  })()

  // returns the user back to admin page, if they try to navigate
  // further without being verified
  useEffect(() => {
    if (localState === LocalState.Rejected) {
      const adminRoute = getRoute({
        routeNode: routeTree.admin,
        routeTree: routeTree,
      })
      if (getPathnameWithoutLocale(pathname, normalizedLocale) !== adminRoute) {
        router.replace(adminRoute)
      }
    }
  }, [localState, pathname, router, normalizedLocale, status])

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
                styleProps={{
                  display: 'flex',
                  flexDirection: 'row',
                  mt: 3,
                  alignItems: 'start',
                }}
              >
                <Star
                  styleProps={{ height: 40, width: 'auto', flexShrink: 0, mt: 0.5 }}
                ></Star>
                <Box
                  component="p"
                  styleProps={{
                    m: 0,
                    display: 'inline-flex',
                    typography: 'body2',
                    ml: 1.5,
                    mt: 0.5,
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.log_in_hint'}
                    ns="luonnonmetsakartat"
                  ></TText>
                </Box>
              </Box>
            </SidebarContentBox>
          )}
          {localState === LocalState.Errored && (
            <SidebarContentBox>
              <Box styleProps={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                {/* <Star styleProps={{ height: 40, width: 'auto' }}></Star> */}
                <Box
                  component="p"
                  styleProps={{
                    m: 0,
                    display: 'inline-flex',
                    typography: 'body2',
                    mt: 0.5,
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.verification_errored'}
                    ns="luonnonmetsakartat"
                  ></TText>
                </Box>
              </Box>
            </SidebarContentBox>
          )}
          {localState === LocalState.Rejected && (
            <SidebarContentBox>
              <Box styleProps={{ display: 'flex', flexDirection: 'row', mt: 3 }}>
                {/* <Star styleProps={{ height: 40, width: 'auto' }}></Star> */}
                <Box
                  component="p"
                  styleProps={{
                    m: 0,
                    display: 'inline-flex',
                    typography: 'body2',
                    ml: 1.5,
                    mt: 0.5,
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.verification_rejected'}
                    ns="luonnonmetsakartat"
                  ></TText>
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
