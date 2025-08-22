'use client'

import React from 'react'

import AppletWrapper from '#/components/common/AppletWrapper'
import { Sidebar } from '#/components/Sidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletWrapper mapContext={'fi_forests'}>
      <Sidebar>{children}</Sidebar>
    </AppletWrapper>
  )
}

export default Layout
