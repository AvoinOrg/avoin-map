import React, { useEffect } from 'react'
import { closeSnackbar, useSnackbar } from 'notistack'

import { useUIStore } from '#/common/store'
import { Box, Typography } from '@mui/material'
import { Cross } from '../icons'
import { useTranslate } from '@tolgee/react'

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
          enqueueSnackbar(
            <Typography sx={{ whiteSpace: 'pre-line' }}>
              {message}
            </Typography>,
            {
              variant: notification.variant || 'default',
              autoHideDuration: notification.duration,
              persist: notification.persist,
              hideIconVariant: true,
              action: (key) => (
                <Box
                  onClick={() => {
                    closeSnackbar(key)
                  }}
                  sx={{
                    height: '100%',
                    '&:hover': { cursor: 'pointer' },
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Cross sx={{ display: 'flex', height: '16px' }}></Cross>
                </Box>
              ),
            }
          )
        }
      })
    }
  }, [notifications, enqueueSnackbar, t, updateNotification])

  return <></>
}

export default NotificationManager
