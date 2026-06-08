import React from 'react'
import { Toast as BaseToast } from '@base-ui/react/toast'
import { css } from 'styled-system/css'

import NotificationManager from './NotificationManager'
import { Cross } from '../icons'

type Props = {
  children: React.ReactNode
}

const viewportClass = css({
  position: 'fixed',
  right: '1rem',
  bottom: '1rem',
  zIndex: 'snackbar',
  display: 'flex',
  flexDirection: 'column-reverse',
  alignItems: 'flex-end',
  gap: '0.5rem',
  width: 'min(24rem, calc(100vw - 2rem))',
  maxWidth: 'calc(100vw - 2rem)',
  outline: 'none',
})

const toastRootClass = css({
  width: '100%',
  borderRadius: '0.25rem',
  backgroundColor: '#313131',
  color: '#ffffff',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.24)',
  opacity: 1,
  transform: 'translateY(0)',
  transition: 'opacity 160ms ease, transform 160ms ease',
  '&[data-starting-style]': {
    opacity: 0,
    transform: 'translateY(0.5rem)',
  },
  '&[data-ending-style]': {
    opacity: 0,
    transform: 'translateY(0.5rem)',
  },
  '&[data-limited]': {
    display: 'none',
  },
  '&[data-type="success"]': {
    backgroundColor: '#2e7d32',
  },
  '&[data-type="error"]': {
    backgroundColor: '#d32f2f',
  },
  '&[data-type="warning"]': {
    backgroundColor: '#ed6c02',
  },
  '&[data-type="info"]': {
    backgroundColor: '#0288d1',
  },
})

const toastContentClass = css({
  boxSizing: 'border-box',
  width: '100%',
  minHeight: '3rem',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '0.75rem',
  px: '1rem',
  py: '0.75rem',
})

const toastDescriptionClass = css({
  m: 0,
  flex: '1 1 auto',
  minWidth: 0,
})

const closeButtonClass = css({
  flex: '0 0 auto',
  width: '1.75rem',
  height: '1.75rem',
  mt: '4px',
  p: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid currentColor',
    outlineOffset: '2px',
  },
})

const NotificationViewport = () => {
  const { toasts, close } = BaseToast.useToastManager()

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        className={viewportClass}
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            className={toastRootClass}
          >
            <BaseToast.Content className={toastContentClass}>
              <BaseToast.Description
                className={toastDescriptionClass}
                render={<div />}
              />
              <button
                type="button"
                aria-label="Close notification"
                className={closeButtonClass}
                onClick={() => {
                  close(toast.id)
                }}
              >
                <Cross sx={{ display: 'flex', height: '16px' }} />
              </button>
            </BaseToast.Content>
          </BaseToast.Root>
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

const NotificationProvider = ({ children }: Props) => {
  return (
    <BaseToast.Provider limit={3} timeout={6000}>
      <NotificationManager />
      <NotificationViewport />
      {children}
    </BaseToast.Provider>
  )
}

export default NotificationProvider
