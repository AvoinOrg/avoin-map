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
import { MainSidebar, Sidebar } from '#/components/Sidebar'
import { FullscreenPageSlot } from '#/components/common/FullscreenPage'
import { getPathnameWithoutLocale } from '#/common/routing/routing'
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

  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname, locale ?? null)
  const useMainSidebar = pathnameWithoutLocale === '/'

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
                  {useMainSidebar ? (
                    <MainSidebar>{children}</MainSidebar>
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
