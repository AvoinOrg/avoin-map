import React, { useEffect } from 'react'
import { closeSnackbar, useSnackbar } from 'notistack'

import { useUIStore } from '#/common/store'
import { Box, Typography } from '@mui/material'
import { Cross } from '../icons'

const NotificationManager = () => {
  const { enqueueSnackbar } = useSnackbar()
  const notifications = useUIStore((state) => state.notifications)
  const updateNotification = useUIStore((state) => state.updateNotification)

  useEffect(() => {
    if (notifications != null) {
      Object.values(notifications).forEach((notification) => {
        if (!notification.shown) {
          updateNotification(notification.id, { shown: true })
          enqueueSnackbar(
            <Typography sx={{ whiteSpace: 'pre-line' }}>
              {notification.message}
            </Typography>,
            {
              variant: notification.variant || 'default',
              autoHideDuration:
                notification.duration || notification.manualDismiss
                  ? null
                  : 6000,
              persist: notification.manualDismiss,
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
  }, [notifications])

  return <></>
}

export default NotificationManager
