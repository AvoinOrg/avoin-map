/* eslint-disable @next/next/no-head-element */

import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import StartShellProviders from '#/start/StartShellProviders'

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="en">
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
    <StartShellProviders>
      <Outlet />
    </StartShellProviders>
  </RootDocument>
)

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start bootstrap',
      },
    ],
  }),
  component: RootComponent,
})
