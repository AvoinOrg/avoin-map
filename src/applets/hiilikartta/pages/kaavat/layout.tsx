'use client'

import React from 'react'

import {
  BreadcrumbNav,
  IntoSidebarHeaderChildrenSlot,
  IntoSidebarPanelSlot,
  SidebarBoundary,
} from '#/components/Sidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarBoundary id="hiilikartta-kaavat-panel" mode="simple">
      <IntoSidebarHeaderChildrenSlot>
        <BreadcrumbNav collapseIfRoot />
      </IntoSidebarHeaderChildrenSlot>
      <IntoSidebarPanelSlot panelId="main">{children}</IntoSidebarPanelSlot>
    </SidebarBoundary>
  )
}

export default Layout
