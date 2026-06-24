import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { arimo } from '#/common/style/theme/fonts'
import { getRootHead } from '#/start/headMetadata'

const getDocumentLanguage = (pathname: string) => {
  const [locale] = pathname.split('/').filter(Boolean)

  return locale === 'fi' ? 'fi' : 'en'
}

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
  const language = useRouterState({
    select: (state) => getDocumentLanguage(state.location.pathname),
  })

  return (
    <html lang={language} className={arimo.variable}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
)

export const Route = createRootRoute({
  head: getRootHead,
  component: RootComponent,
})
