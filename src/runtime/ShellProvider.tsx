import React, { useState, type ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientProviderProps,
} from '@tanstack/react-query'
import type { TolgeeStaticData } from '@tolgee/web'
import 'overlayscrollbars/overlayscrollbars.css'

import { AuthSessionProvider } from '#/common/auth'
import { TolgeeAppProvider } from '#/common/navigation/tolgee/client'
import AppThemeProvider from '#/common/style/theme/AppThemeProvider'
import NotificationProvider from '#/components/Notification/NotificationProvider'

const StableQueryClientProvider =
  QueryClientProvider as React.ComponentType<QueryClientProviderProps>

type Props = {
  locale: string
  tolgeeStaticData: TolgeeStaticData
  children: ReactNode
}

const ShellProvider = ({
  locale,
  tolgeeStaticData,
  children,
}: Props) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <TolgeeAppProvider locale={locale} staticData={tolgeeStaticData}>
      <AuthSessionProvider>
        <AppThemeProvider>
          <NotificationProvider>
            <StableQueryClientProvider client={queryClient}>
              {children}
            </StableQueryClientProvider>
          </NotificationProvider>
        </AppThemeProvider>
      </AuthSessionProvider>
    </TolgeeAppProvider>
  )
}

export default ShellProvider
