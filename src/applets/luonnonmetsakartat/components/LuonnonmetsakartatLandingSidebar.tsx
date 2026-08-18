import React from 'react'

import {
  BreadcrumbNav,
  IntoSidebarHeaderSlot,
  SidebarBoundary,
  SidebarHeader,
} from '#/components/Sidebar'

type Props = {
  boundaryId: string
  children: React.ReactNode
}

const SIDEBAR_BOUNDARY_CONFIG = { width: 'compact' } as const

const LuonnonmetsakartatLandingSidebar = ({
  boundaryId,
  children,
}: Props) => {
  return (
    <SidebarBoundary
      id={boundaryId}
      mode="floating"
      config={SIDEBAR_BOUNDARY_CONFIG}
    >
      <IntoSidebarHeaderSlot>
        <SidebarHeader
          title="Luonnonmetsäkartat"
          backgroundImage="/files/img/main-sidebar/forests-hero.jpg"
        >
          <BreadcrumbNav collapseIfRoot={true} />
        </SidebarHeader>
      </IntoSidebarHeaderSlot>
      {children}
    </SidebarBoundary>
  )
}

export default LuonnonmetsakartatLandingSidebar
