import React, { useEffect } from 'react'
import { closeSnackbar, useSnackbar } from 'notistack'
import { useTranslate } from '@tolgee/react'

import { useUIStore } from '#/common/store/uiStore'
import { Box, type AppTheme } from '#/common/style/theme/system'
import { Cross } from '../icons'

type SystemAnchorProps = React.ComponentProps<typeof Box> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>
type SystemButtonProps = React.ComponentProps<typeof Box> &
  React.ButtonHTMLAttributes<HTMLButtonElement>

const closeButtonSx = {
  width: 28,
  height: 28,
  minWidth: 28,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'inherit',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  p: 0,
  m: 0,
  marginTop: '4px',
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  '&:focus-visible': {
    outline: (theme: AppTheme) =>
      `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 2,
  },
}

const NotificationManager = () => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslate('avoin-map')
  const notifications = useUIStore((state) => state.notifications)
  const updateNotification = useUIStore((state) => state.updateNotification)

  useEffect(() => {
    if (notifications != null) {
      Object.values(notifications).forEach((notification) => {
        if (!notification.shown) {
          const message =
            notification.message ??
            (notification.keyName
              ? t(
                  notification.keyName,
                  notification.ns ? { ns: notification.ns } : undefined
                )
              : '')
          if (!message) {
            console.warn(
              '[NotificationManager] Notification missing message/keyName:',
              notification.id
            )
            updateNotification(notification.id, { shown: true })
            return
          }
          updateNotification(notification.id, { shown: true })

          const linkLabel =
            notification.link?.label ??
            (notification.link?.keyName
              ? t(
                  notification.link.keyName,
                  notification.link.ns
                    ? { ns: notification.link.ns }
                    : undefined
                )
              : undefined)

          const messageNode = (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box
                component="span"
                sx={{ typography: 'body2', whiteSpace: 'pre-line' }}
              >
                {message}
              </Box>
              {notification.link != null && linkLabel != null && (
                <Box
                  {...({
                    component: 'a',
                    href: notification.link.href,
                  } as SystemAnchorProps)}
                  sx={{
                    cursor: 'pointer',
                    color: 'inherit',
                    fontWeight: 500,
                    textDecoration: 'underline',
                  }}
                >
                  {linkLabel}
                </Box>
              )}
            </Box>
          )

          enqueueSnackbar(messageNode, {
            variant: notification.variant || 'default',
            autoHideDuration: notification.duration,
            persist: notification.persist,
            hideIconVariant: true,
            action: (key) => (
              <Box
                {...({
                  component: 'button',
                  type: 'button',
                  'aria-label': 'Close notification',
                  onClick: () => {
                    closeSnackbar(key)
                  },
                } as SystemButtonProps)}
                sx={closeButtonSx}
              >
                <Cross sx={{ display: 'flex', height: '16px' }}></Cross>
              </Box>
            ),
          })
        }
      })
    }
  }, [notifications, enqueueSnackbar, t, updateNotification])

  return <></>
}

export default NotificationManager
