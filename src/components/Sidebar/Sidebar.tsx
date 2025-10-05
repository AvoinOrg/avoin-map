'use client'

import React, { useEffect, useRef } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
// import { MapPopup } from '../Map/MapPopup_old'
import Drawer from './Drawer'
import { SidebarHeader, SidebarToggleButton } from '#/components/Sidebar'
import { Navbar } from './Navbar'
import { LoadingSpinner } from '../Loading'
import { SidebarDrawerContainer } from './SidebarDrawerContainer'

export const Sidebar = ({
  headerElement,
  navbarElement,
  sx,
  children,
}: {
  headerElement?: React.ReactNode
  navbarElement?: React.ReactNode
  sx?: SxProps<Theme>
  children: React.ReactNode
}) => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isSidebarDrawerOpen = useUIStore((state) => state.isSidebarDrawerOpen)
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)
  const isNavbarHidden = useUIStore((state) => state.isNavbarHidden)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)

  // const popupOpts = useMapStore((state) => state.popupOpts)

  const sidebarRef = useRef()

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setSidebarWidth(entries[0].contentRect.width)
    })

    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current)
    }

    return () => {
      if (sidebarRef.current) {
        resizeObserver.unobserve(sidebarRef.current)
      }
    }
  }, [])

  return (
    <Box
      ref={sidebarRef}
      sx={{
        zIndex: 'drawer',
        display: 'flex',
        minWidth: 0,
        width: '100%',
        flexDirection: 'row',
        maxWidth: '100%',
        position: 'relative',
        minHeight: 0,
        flex: 1,
        pointerEvents: 'none',
      }}
    >
      <Box
        className="sidebar-container"
        sx={[
          {
            minHeight: 0,
            minWidth: 0,
            flex: '1',
            maxWidth: '30rem',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents:
              isSidebarOpen || isSidebarDrawerOpen ? 'auto' : 'none',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <SidebarToggleButton
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: theme.zIndex.drawer + 11,
            pointerEvents: 'auto',
          })}
        />
        <Box
          sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}
        >
          <Drawer open={isSidebarOpen}>
            {headerElement ? (
              headerElement
            ) : (
              <SidebarHeader title={'avoin map'}></SidebarHeader>
            )}
            {isSidebarLoading && (
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: theme.zIndex.drawer + 10,
                  borderRadius: 'inherit', // Inherit border radius from parent if needed
                })}
              >
                <LoadingSpinner size="5rem" />
              </Box>
            )}
            <Box
              sx={[
                {
                  overflow: 'auto',
                  display: 'flex',
                  flexGrow: 1,
                  maxWidth: '100vw',
                  backgroundColor: 'neutral.lighter',
                },
              ]}
            >
              {children}
            </Box>
            {!isNavbarHidden &&
              (navbarElement ? navbarElement : <Navbar></Navbar>)}
          </Drawer>
        </Box>
        {/* {mode === 'full' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
          }}
        >
          {children}
        </Box>
      )} */}
      </Box>
      <SidebarDrawerContainer></SidebarDrawerContainer>
    </Box>
  )
}

export default Sidebar
