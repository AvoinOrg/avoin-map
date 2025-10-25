'use client'

import React from 'react'

import AppletWrapper from '#/components/common/AppletWrapper'
import { BreadcrumbNav, Sidebar, SidebarHeader } from '#/components/Sidebar'
import { routeTree } from 'map/common/routes'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletWrapper
      mapContext={'forests'}
      isNavbarHidden={true}
      localizationNamespace={'fi-forests'}
      listedLayerGroups={defaultListedLayerGroups}
    >
      <Sidebar
        headerElement={
          <SidebarHeader title={'avoin map'}>
            <BreadcrumbNav
              collapseIfRoot={true}
              routeTree={routeTree}
            ></BreadcrumbNav>
          </SidebarHeader>
        }
      >
        {children}
      </Sidebar>
    </AppletWrapper>
  )
}

export default Layout
