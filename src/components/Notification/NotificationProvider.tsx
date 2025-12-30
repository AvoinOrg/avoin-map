import React from 'react'
import { SnackbarProvider } from 'notistack'
import { GlobalStyles } from '@mui/material'

import NotificationManager from './NotificationManager'

type Props = {
  children: React.ReactNode
}

const NotificationProvider = ({ children }: Props) => {
  return (
    <>
      <GlobalStyles
        styles={(theme) => ({
          '.notistack-SnackbarContainer': {
            zIndex: `${theme.zIndex.snackbar} !important`,
          },
        })}
      />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        // Components={{
        //   reportComplete: ReportCompleteSnackbar,
        // }}
      >
        <NotificationManager />
        {children}
      </SnackbarProvider>
    </>
  )
}

export default NotificationProvider
