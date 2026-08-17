import React from 'react'
import { Dialog } from '@base-ui/react/dialog'

import {
  Box,
  type AppTheme,
} from '#/common/style/theme/system'
import { SHARED_CONTROL_BORDER_RADIUS } from '#/common/style/theme/constants'
import { useUIStore } from '#/common/store/uiStore'
import { Cross } from '#/components/icons'

type Props = {
  iframeSrc?: string
  iframeTitle?: string
}

const closeButtonSx = {
  position: 'sticky',
  top: 0,
  alignSelf: 'flex-end',
  width: 48,
  height: 48,
  minWidth: 48,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: SHARED_CONTROL_BORDER_RADIUS,
  color: 'inherit',
  p: 0,
  m: 1,
  '&:hover': {
    backgroundColor: 'action.hover',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: (theme: AppTheme) =>
      `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 2,
  },
}

export const LoginModal = ({
  iframeSrc = '/en/adds/login',
  iframeTitle = 'Login modal content',
}: Props) => {
  const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen)
  const setIsLoginModalOpen = useUIStore((state) => state.setIsLoginModalOpen)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const positionOffset = isSidebarOpen ? (sidebarWidth ?? 0) / 2 : 0

  return (
    <Dialog.Root
      open={isLoginModalOpen}
      onOpenChange={(nextOpen) => {
        setIsLoginModalOpen(nextOpen)
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          render={(backdropProps) => (
            <Box
              {...backdropProps}
              sx={(theme) => ({
                position: 'fixed',
                inset: 0,
                zIndex: theme.zIndex.modal,
                backgroundColor: 'transparent',
              })}
            />
          )}
        />
        <Dialog.Popup
          aria-label="Login modal"
          className="login-modal-container"
          render={(popupProps) => (
            <Box
              {...popupProps}
              sx={(theme) => ({
                zIndex: theme.zIndex.modal,
                position: 'fixed',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 0,
                top: {
                  mobile: 0,
                  desktop: '50%',
                },
                right: {
                  mobile: 0,
                  desktop: 'auto',
                },
                bottom: {
                  mobile: 0,
                  desktop: 'auto',
                },
                left: {
                  mobile: 0,
                  desktop: `calc(50% + ${positionOffset}px)`,
                },
                transform: {
                  mobile: 'none',
                  desktop: 'translate(-50%, -50%)',
                },
                p: {
                  mobile: 0,
                  desktop: 0,
                },
                backgroundColor: theme.palette.neutral.lighter,
              })}
            />
          )}
        >
          <Dialog.Close
            aria-label="Close login modal"
            render={(closeProps) => (
              <Box {...closeProps} component="button" sx={closeButtonSx}>
                <Cross sx={{ width: 18, height: 18 }} />
              </Box>
            )}
          />

          <Box
            sx={{
              width: '100%',
              height: '100%',
            }}
          >
            <iframe
              src={iframeSrc}
              title={iframeTitle}
              style={{
                border: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            />
          </Box>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
