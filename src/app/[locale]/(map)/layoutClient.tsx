'use client'

import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { useParams, usePathname } from 'next/navigation'

import { MapHandler } from '#/components/Map'
import { LoginModal } from '#/components/Modal'
import { ConfirmationDialog } from '#/components/Notification'
import UserStateHandler from './userStateHandler'
import UIStateHandler from './uiStateHandler'
import { SlotsProvider } from '#/components/context/slotsContext'
import {
  HiilikarttaHomeSidebar,
  MainSidebar,
  Sidebar,
  SimpleSidebar,
} from '#/components/Sidebar'
import { FullscreenPageSlot } from '#/components/common/FullscreenPage'
import {
  compiledApplets,
  getPathnameWithoutLocale,
} from '#/common/routing/routing'
import { useUIStore } from '#/common/store'
// import { UserModal } from '#/components/Profile'
// import { UiStateProvider, UserStateProvider } from '#/components/State'
// import RootStyleRegistry from './emotion'

const LayoutClient = ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children?: React.ReactNode
}) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const pathname = usePathname()
  const { locale } = useParams()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const pathnameWithoutLocale = getPathnameWithoutLocale(
    pathname,
    locale ?? null
  )
  const isStandaloneHiilikartta =
    compiledApplets.length === 1 && compiledApplets[0] === 'hiilikartta'
  const isStandaloneEnergiakartta =
    compiledApplets.length === 1 && compiledApplets[0] === 'energiakartta'
  const isStandaloneForests =
    compiledApplets.length === 1 && compiledApplets[0] === 'forests'
  const useMainSidebar =
    pathnameWithoutLocale === '/' &&
    !isStandaloneHiilikartta &&
    !isStandaloneEnergiakartta
  const useHiilikarttaHomeSidebar =
    pathnameWithoutLocale === '/hiilikartta' ||
    (isStandaloneHiilikartta && pathnameWithoutLocale === '/')
  const useAppletOwnedSidebar =
    pathnameWithoutLocale.startsWith('/hiilikartta/kaavat') ||
    (isStandaloneHiilikartta && pathnameWithoutLocale.startsWith('/kaavat')) ||
    pathnameWithoutLocale === '/energiakartta' ||
    (isStandaloneEnergiakartta && pathnameWithoutLocale === '/') ||
    pathnameWithoutLocale === '/forests' ||
    (isStandaloneForests && pathnameWithoutLocale === '/')
  const sidebarVariant = useUIStore((state) => state.sidebarVariant)
  const isMapLayoutSidebarDisabled = useUIStore(
    (state) => state.isMapLayoutSidebarDisabled
  )

  return (
    <>
      {/* <UserStateProvider> */}
      {isHydrated && (
        <UserStateHandler>
          <UIStateHandler>
            <SlotsProvider>
              <MapHandler>
                {/* <UserModal /> */}
                <Box
                  className="layout-container"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    width: '100vw',
                    zIndex: 'drawer',
                  }}
                >
                  {isMapLayoutSidebarDisabled || useAppletOwnedSidebar ? (
                    children
                  ) : useMainSidebar ? (
                    <MainSidebar>{children}</MainSidebar>
                  ) : useHiilikarttaHomeSidebar ? (
                    <HiilikarttaHomeSidebar>{children}</HiilikarttaHomeSidebar>
                  ) : sidebarVariant === 'simple' ? (
                    <SimpleSidebar>{children}</SimpleSidebar>
                  ) : (
                    <Sidebar>{children}</Sidebar>
                  )}
                </Box>
                <FullscreenPageSlot />
                <LoginModal></LoginModal>
                <ConfirmationDialog></ConfirmationDialog>
              </MapHandler>
            </SlotsProvider>
          </UIStateHandler>
        </UserStateHandler>
      )}
      {/* </UserStateProvider> */}
    </>
  )
}

export default LayoutClient
