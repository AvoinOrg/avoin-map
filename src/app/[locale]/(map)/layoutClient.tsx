'use client'

import '#/common/style/index.css'

import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'

import { Sidebar } from '#/components/Sidebar'
import { NavBar } from '#/components/NavBar'
import { Map } from '#/components/Map'
import { LoginModal } from '#/components/Modal'
import { ConfirmationDialog } from '#/components/Notification'
import StateHandler from './stateHandler'
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

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <>
      {/* <UserStateProvider> */}
      {isHydrated && (
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
      )}
      {/* </UserStateProvider> */}
    </>
  )
}

export default LayoutClient
