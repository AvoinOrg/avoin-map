'use client'

import React from 'react'

import { SidebarVariantBoundary } from '#/components/Sidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <SidebarVariantBoundary variant="simple">{children}</SidebarVariantBoundary>
}

export default Layout
