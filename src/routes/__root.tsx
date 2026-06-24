import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { arimo } from '#/common/style/theme/fonts'
import { getRootHead } from '#/start/headMetadata'

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="en" className={arimo.variable}>
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
      <Scripts />
    </body>
  </html>
)

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
)

export const Route = createRootRoute({
  head: getRootHead,
  component: RootComponent,
})
