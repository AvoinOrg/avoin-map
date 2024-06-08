'use client'

import React, { useEffect, useRef } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { useUIStore } from '#/common/store'
import { MapPopup } from '../Map/MapPopup'
import { useMapStore } from '#/common/store'
import Drawer from './Drawer'
import PopupDrawer from './PopupDrawer'
import { SidebarHeader, SidebarToggleButton } from '#/components/Sidebar'
import { Navbar } from './Navbar'

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
  const isMapPopupOpen = useUIStore((state) => state.isMapPopupOpen)
  const setIsMapPopupOpen = useUIStore((state) => state.setIsMapPopupOpen)
  const popupOpts = useMapStore((state) => state.popupOpts)

  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)

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
      className="sidebar-container"
      sx={{
        zIndex: 'drawer',
        // backgroundColor: 'white',
        minHeight: 0,
        width: 'max-content',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <SidebarToggleButton
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: theme.zIndex.drawer + 1,
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
          <Box
            ref={sidebarRef}
            sx={[
              {
                overflow: 'auto',
                display: 'flex',
                flexGrow: 1,
                maxWidth: '100vw',
                width: '27.5rem',
                backgroundColor: 'neutral.lighter',
              },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
          >
            {children}
          </Box>
          {navbarElement ? navbarElement : <Navbar></Navbar>}
        </Drawer>

        <PopupDrawer open={isMapPopupOpen}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                textDecoration: 'none',
                alignSelf: 'flex-end',
                margin: '10px 10px 0 0',
                '&:after': {
                  content: "'✖'",
                },
              }}
              onClick={() => setIsMapPopupOpen(false)}
            />
            <MapPopup popupOpts={popupOpts} />
          </Box>
        </PopupDrawer>
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
  )
}

export default Sidebar
