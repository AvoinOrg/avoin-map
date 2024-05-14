import '#/common/style/index.css'

import React from 'react'
import { TolgeeNextProvider } from '@/tolgee/client'

import LayoutClient from '../layoutClient'

const Layout = ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <LayoutClient>
      <TolgeeNextProvider>{children}</TolgeeNextProvider>
    </LayoutClient>
  )
}

export default Layout
