import React from 'react'

import AppletLayout from '#/components/common/AppletLayout'
import LayoutClient from './layoutClient'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletLayout>
      <LayoutClient>{children}</LayoutClient>
    </AppletLayout>
  )
}

export default Layout
