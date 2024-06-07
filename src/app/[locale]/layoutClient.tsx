'use client'

import '#/common/style/index.css'

import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@mui/material/styles'

import { theme } from '#/common/style/theme'
import { queryClient } from '#/common/queries/queryClient'
import { NotificationProvider } from '#/components/Notification'
// import { UserModal } from '#/components/Profile'
// import { UiStateProvider, UserStateProvider } from '#/components/State'
// import RootStyleRegistry from './emotion'

const LayoutClient = ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <SessionProvider>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </QueryClientProvider>
      </NotificationProvider>
    </SessionProvider>
  )
}

export default LayoutClient
