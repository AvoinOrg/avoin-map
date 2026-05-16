'use client'

import React from 'react'

import AppletWrapper from '#/components/common/AppletWrapper'
import { BreadcrumbNav, SidebarBoundary } from '#/components/Sidebar'
import { mainRouteTree } from '#/common/routing/routes/main'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarBoundary
      id="forests-panel"
      mode="panel"
      config={{ panelLayout: 'single' }}
    >
      <AppletWrapper
        mapContext={'forests'}
        isNavbarHidden={true}
        localizationNamespace={'fi-forests'}
        listedLayerGroups={defaultListedLayerGroups}
        sidebarHeaderChildren={
          <BreadcrumbNav
            collapseIfRoot={true}
            routeTree={mainRouteTree}
          ></BreadcrumbNav>
        }
      >
        {children}
      </AppletWrapper>
    </SidebarBoundary>
  )
}

export default LayoutClient
