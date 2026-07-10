'use client'

import React from 'react'

import AppletWrapper from '#/components/common/AppletWrapper'
import { BreadcrumbNav, SidebarBoundary } from '#/components/Sidebar'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'

const ForestsAppletRuntime = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <SidebarBoundary id="forests-panel" mode="simple">
      <AppletWrapper
        mapContext={'forests'}
        isNavbarHidden={true}
        localizationNamespace={'fi-forests'}
        listedLayerGroups={defaultListedLayerGroups}
        sidebarHeaderChildren={
          <BreadcrumbNav collapseIfRoot={true}></BreadcrumbNav>
        }
      >
        {children}
      </AppletWrapper>
    </SidebarBoundary>
  )
}

export default ForestsAppletRuntime
