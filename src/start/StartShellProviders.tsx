import React, { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TolgeeProvider } from '@tolgee/react'
import { FormatIcu } from '@tolgee/format-icu'
import { Tolgee } from '@tolgee/web'
import 'overlayscrollbars/overlayscrollbars.css'

import AppThemeProvider from '#/common/style/theme/AppThemeProvider'
import NotificationProvider from '#/components/Notification/NotificationProvider'

const START_TOLGEE_LANGUAGE = 'en'
const START_TOLGEE_DEFAULT_NS = 'avoin-map'
const START_TOLGEE_STATIC_DATA = {
  [`${START_TOLGEE_LANGUAGE}:${START_TOLGEE_DEFAULT_NS}`]: {},
}

type Props = {
  children: ReactNode
}

const StartTemporaryTolgeeBridge = ({ children }: Props) => {
  const [tolgee] = useState(() =>
    Tolgee()
      .use(FormatIcu())
      .init({
        language: START_TOLGEE_LANGUAGE,
        defaultNs: START_TOLGEE_DEFAULT_NS,
        availableNs: [START_TOLGEE_DEFAULT_NS],
        staticData: START_TOLGEE_STATIC_DATA,
        autoLoadRequiredData: false,
      })
  )

  return (
    <TolgeeProvider
      tolgee={tolgee}
      ssr={{
        language: START_TOLGEE_LANGUAGE,
        staticData: START_TOLGEE_STATIC_DATA,
      }}
    >
      {children}
    </TolgeeProvider>
  )
}

const StartTemporaryAuthBridge = ({ children }: Props) => {
  // Temporary no-op: F048.4 owns the real Start auth/session provider.
  return <>{children}</>
}

const StartShellProviders = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <StartTemporaryTolgeeBridge>
      <StartTemporaryAuthBridge>
        <AppThemeProvider>
          <NotificationProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </NotificationProvider>
        </AppThemeProvider>
      </StartTemporaryAuthBridge>
    </StartTemporaryTolgeeBridge>
  )
}

export default StartShellProviders
