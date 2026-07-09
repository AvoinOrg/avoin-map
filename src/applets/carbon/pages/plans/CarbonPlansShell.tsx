'use client'

import { Outlet } from '@tanstack/react-router'

import {
  BreadcrumbNav,
  IntoSidebarHeaderChildrenSlot,
  IntoSidebarPanelSlot,
  SidebarBoundary,
} from '#/components/Sidebar'

const CarbonPlansShell = () => {
  return (
    <SidebarBoundary id="hiilikartta-kaavat-panel" mode="simple">
      <IntoSidebarHeaderChildrenSlot>
        <BreadcrumbNav collapseIfRoot />
      </IntoSidebarHeaderChildrenSlot>
      <IntoSidebarPanelSlot panelId="main">
        <Outlet />
      </IntoSidebarPanelSlot>
    </SidebarBoundary>
  )
}

export default CarbonPlansShell
