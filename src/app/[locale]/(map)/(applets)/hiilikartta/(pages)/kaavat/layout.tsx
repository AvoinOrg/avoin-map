'use client'

import React from 'react'

import { MapLayoutSidebarBoundary, SimpleSidebar } from '#/components/Sidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MapLayoutSidebarBoundary>
      <SimpleSidebar>{children}</SimpleSidebar>
    </MapLayoutSidebarBoundary>
  )
}

export default Layout
