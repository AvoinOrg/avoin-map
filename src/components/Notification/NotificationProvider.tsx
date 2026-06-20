import React from 'react'
import { SnackbarProvider } from 'notistack'
import { GlobalStyles } from '@mui/system'

import type { AppTheme } from '#/common/style/theme/system'
import NotificationManager from './NotificationManager'

type Props = {
  children: React.ReactNode
}

const NotificationProvider = ({ children }: Props) => {
  return (
    <>
      <GlobalStyles
        styles={(theme) => {
          const appTheme = theme as AppTheme

          return {
            '.notistack-SnackbarContainer': {
              zIndex: `${appTheme.zIndex.snackbar} !important`,
            },
            '.notistack-MuiContent': {
              alignItems: 'flex-start',
            },
            '#notistack-snackbar': {
              alignItems: 'flex-start',
            },
          }
        }}
      />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <NotificationManager />
        {children}
      </SnackbarProvider>
    </>
  )
}

export default NotificationProvider
