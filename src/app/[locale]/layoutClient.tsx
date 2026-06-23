'use client'

import React from 'react'
import {
  QueryClientProvider,
  type QueryClientProviderProps,
} from '@tanstack/react-query'
import { SessionProvider, type SessionProviderProps } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'

import { AuthSessionProvider } from '#/common/auth'
import { AppThemeProvider } from '#/common/style/theme'
import { queryClient } from '#/common/queries/queryClient'
import { NotificationProvider } from '#/components/Notification'
import 'overlayscrollbars/overlayscrollbars.css'

const NextAuthCompatibilitySessionProvider =
  SessionProvider as React.ComponentType<SessionProviderProps>
const StableQueryClientProvider =
  QueryClientProvider as React.ComponentType<QueryClientProviderProps>

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
      {/* NextAuth remains for unmigrated Next-runtime consumers; Better Auth powers the migrated app-shell user handoff. */}
      <NextAuthCompatibilitySessionProvider>
        <AuthSessionProvider>
          <AppThemeProvider>
            <NotificationProvider>
              <StableQueryClientProvider client={queryClient}>
                {children}
              </StableQueryClientProvider>
            </NotificationProvider>
          </AppThemeProvider>
        </AuthSessionProvider>
      </NextAuthCompatibilitySessionProvider>
    </NextIntlClientProvider>
  )
}

export default LayoutClient
