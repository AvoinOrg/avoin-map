import React, { useEffect } from 'react'
import { IntoSlot, Slot } from '../context/slotsContext'
import { Box, IconButton, SxProps, Theme } from '@mui/material'
import { useUIStore } from '#/common/store/uiStore'
import { Cross } from '../icons'

type SidebarDrawerContainerProps = {
  children?: React.ReactNode
  showCloseButton?: boolean
  onClose?: () => void
  sx?: SxProps<Theme>
}

export const SidebarDrawerContainer = ({
  children,
  showCloseButton = true,
  onClose,
  sx,
}: SidebarDrawerContainerProps) => {
  const isSidebarDrawerOpen = useUIStore((state) => state.isSidebarDrawerOpen)
  const setIsSidebarDrawerOpen = useUIStore(
    (state) => state.setIsSidebarDrawerOpen
  )

  // useEffect(() => {
  //   setIsSidebarDrawerOpen(true)
  //   return () => {
  //     setIsSidebarDrawerOpen(false)
  //   }
  // }, [])

  const handleClose = () => {
    setIsSidebarDrawerOpen(false)
    onClose?.()
  }

  return (
    <IntoSlot name="sidebar-drawer">
      {isSidebarDrawerOpen && (
        <Box
          className="sidebar-drawer-content"
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              height: '100%',
              backgroundColor: 'neutral.light',
              minHeight: 0,
              zIndex: (theme) => theme.zIndex.drawer + 2,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {showCloseButton && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  p: 1,
                  pointerEvents: 'auto',
                }}
              >
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  sx={{
                    color: (theme) => theme.palette.grey[500],
                    mt: 2,
                    mr: 2,
                  }}
                >
                  <Cross sx={{ height: '1.5rem', width: '1.5rem' }} />
                </IconButton>
              </Box>
            </Box>
          )}
          {children}
        </Box>
      )}
    </IntoSlot>
  )
}
