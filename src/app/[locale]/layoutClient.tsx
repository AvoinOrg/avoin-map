'use client'

import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'

import { AppThemeProvider } from '#/common/style/theme'
import { queryClient } from '#/common/queries/queryClient'
import { NotificationProvider } from '#/components/Notification'
// import { UserModal } from '#/components/Profile'
// import { UiStateProvider, UserStateProvider } from '#/components/State'
// import RootStyleRegistry from './emotion'
import 'overlayscrollbars/overlayscrollbars.css'

const LayoutClient = ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  locale,
}: {
  children: React.ReactNode
  locale: string
}) => {
  return (
    // TODO: Does this even do anything? Figure it out.
    // Supposedly the locale needs to be supplied
    <NextIntlClientProvider locale={locale}>
      <SessionProvider>
        <AppThemeProvider>
          <NotificationProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </NotificationProvider>
        </AppThemeProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  )
}

export default LayoutClient
