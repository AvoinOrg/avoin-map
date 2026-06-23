import React, { useState, type ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientProviderProps,
} from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { TolgeeProvider } from '@tolgee/react'
import { FormatIcu } from '@tolgee/format-icu'
import { Tolgee } from '@tolgee/web'
import {
  SessionProvider,
  type SessionProviderProps,
} from 'next-auth/react'
import 'overlayscrollbars/overlayscrollbars.css'

import {
  DEFAULT_LOCALE,
  LOCALES,
} from '#/common/navigation/tolgee/shared'
import AppThemeProvider from '#/common/style/theme/AppThemeProvider'
import NotificationProvider from '#/components/Notification/NotificationProvider'

const START_TOLGEE_DEFAULT_NS = 'avoin-map'
const START_TOLGEE_NAMESPACES = [
  START_TOLGEE_DEFAULT_NS,
  'fi-forests',
  'energiakartta',
] as const
const START_TOLGEE_LANGUAGES =
  LOCALES.length > 0 ? LOCALES : [DEFAULT_LOCALE]
const START_TOLGEE_STATIC_DATA = Object.fromEntries(
  START_TOLGEE_LANGUAGES.flatMap((language) =>
    START_TOLGEE_NAMESPACES.map((namespace) => [
      `${language}:${namespace}`,
      { __start_namespace_ready__: '' },
    ])
  )
)
const StableSessionProvider =
  SessionProvider as React.ComponentType<SessionProviderProps>
const StableQueryClientProvider =
  QueryClientProvider as React.ComponentType<QueryClientProviderProps>

type Props = {
  children: ReactNode
}

const getLocaleFromPathname = (pathname: string) => {
  const [firstSegment] = pathname.split('/').filter(Boolean)

  return firstSegment && LOCALES.includes(firstSegment)
    ? firstSegment
    : DEFAULT_LOCALE
}

const StartTemporaryTolgeeBridge = ({ children }: Props) => {
  const locale = useRouterState({
    select: (state) => getLocaleFromPathname(state.location.pathname),
  })
  const [tolgee] = useState(() =>
    Tolgee()
      .use(FormatIcu())
      .init({
        language: locale,
        defaultNs: START_TOLGEE_DEFAULT_NS,
        availableNs: [...START_TOLGEE_NAMESPACES],
        staticData: START_TOLGEE_STATIC_DATA,
        autoLoadRequiredData: false,
      })
  )

  React.useEffect(() => {
    void tolgee.changeLanguage(locale)
  }, [locale, tolgee])

  return (
    <TolgeeProvider
      tolgee={tolgee}
      ssr={{
        language: locale,
        staticData: START_TOLGEE_STATIC_DATA,
      }}
    >
      {children}
    </TolgeeProvider>
  )
}

const StartTemporaryAuthBridge = ({ children }: Props) => {
  // Temporary unauthenticated session provider: F048.4 owns real Start auth.
  return <StableSessionProvider session={null}>{children}</StableSessionProvider>
}

const StartShellProviders = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <StartTemporaryTolgeeBridge>
      <StartTemporaryAuthBridge>
        <AppThemeProvider>
          <NotificationProvider>
            <StableQueryClientProvider client={queryClient}>
              {children}
            </StableQueryClientProvider>
          </NotificationProvider>
        </AppThemeProvider>
      </StartTemporaryAuthBridge>
    </StartTemporaryTolgeeBridge>
  )
}

export default StartShellProviders
