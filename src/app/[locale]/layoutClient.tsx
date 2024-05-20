'use client'

import '#/common/style/index.css'

import React, { useEffect, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Box } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

import theme from '#/common/style/theme'
import { queryClient } from '#/common/queries/queryClient'
import { Sidebar } from '#/components/Sidebar'
import { NavBar } from '#/components/NavBar'
import { Map } from '#/components/Map'
import { LoginModal } from '#/components/Modal'
import {
  ConfirmationDialog,
  NotificationProvider,
} from '#/components/Notification'
import StateHandler from './stateHandler'
// import { UserModal } from '#/components/Profile'
// import { UiStateProvider, UserStateProvider } from '#/components/State'
// import RootStyleRegistry from './emotion'

const LayoutClient = ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) => {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      {/* <UserStateProvider> */}
      <CssBaseline>
        {isHydrated && (
          <SessionProvider>
            <NotificationProvider>
              <QueryClientProvider client={queryClient}>
                <StateHandler>
                  <Map>
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
                      <Sidebar>{children}</Sidebar>
                      <NavBar />
                    </Box>
                    <LoginModal></LoginModal>
                    <ConfirmationDialog></ConfirmationDialog>
                  </Map>
                </StateHandler>
              </QueryClientProvider>
            </NotificationProvider>
          </SessionProvider>
        )}
      </CssBaseline>
      {/* </UserStateProvider> */}
    </ThemeProvider>
  )
}

export default LayoutClient
