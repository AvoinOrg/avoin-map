'use client'

import React from 'react'

import { routeTree } from '#/common/routing/routes/hiilikartta'
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
        <BreadcrumbNav routeTree={routeTree} collapseIfRoot />
      </IntoSidebarHeaderChildrenSlot>
      <IntoSidebarPanelSlot panelId="main">{children}</IntoSidebarPanelSlot>
    </SidebarBoundary>
  )
}

export default Layout
