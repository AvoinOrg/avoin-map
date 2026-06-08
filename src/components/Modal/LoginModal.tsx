import React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { css } from 'styled-system/css'

import { useUIStore } from '#/common/store/uiStore'
import { visuallyHiddenClass } from '#/components/common/formControlStyles'
import { Cross } from '#/components/icons'

const popupClass = css({
  zIndex: 'modal',
  position: 'fixed',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'neutral.lighter',
  desktop: {
    top: '50%',
    left: 'calc(50% + var(--login-modal-offset, 0px))',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    p: 0,
  },
})

const closeButtonClass = css({
  position: 'sticky',
  top: '0',
  right: '0',
  alignSelf: 'flex-end',
  width: '3rem',
  height: '3rem',
  p: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '-2px',
  },
})

const iframeClass = css({
  border: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
})

export const LoginModal = () => {
  const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen)
  const setIsLoginModalOpen = useUIStore((state) => state.setIsLoginModalOpen)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const positionOffset =
    isSidebarOpen && isLoginModalOpen ? (sidebarWidth ?? 0) / 2 : 0

  return (
    <BaseDialog.Root
      open={isLoginModalOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setIsLoginModalOpen(false)
        }
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Popup
          className={`login-modal-container ${popupClass}`}
          style={
            {
              '--login-modal-offset': `${positionOffset}px`,
            } as React.CSSProperties
          }
        >
          <BaseDialog.Title className={visuallyHiddenClass}>
            Login
          </BaseDialog.Title>
          <BaseDialog.Close
            type="button"
            className={closeButtonClass}
            aria-label="Close login modal"
          >
            <Cross sx={{ width: '1.5rem', height: '1.5rem' }} />
          </BaseDialog.Close>

          <iframe
            src="/en/adds/login"
            title="My iframe Example"
            className={iframeClass}
          />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
