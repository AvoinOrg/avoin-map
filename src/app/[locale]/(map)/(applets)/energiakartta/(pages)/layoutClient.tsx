'use client'

import React from 'react'

import { routeTree } from '#/common/routing/routes/energiakartta'
import { BreadcrumbNav, SidebarBoundary } from '#/components/Sidebar'
import AppletWrapper from '#/components/common/AppletWrapper'
import { listedLayerGroups } from '../common/constants'

const localizationNamespace = 'energiakartta'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarBoundary
      id="energiakartta-floating"
      mode="floating"
      config={{
        width: 'compact',
      }}
    >
      <AppletWrapper
        mapContext={'energiakartta'}
        localizationNamespace={localizationNamespace}
        isNavbarHidden={true}
        listedLayerGroups={listedLayerGroups}
        sidebarHeaderTitle={'Energiakartta'}
        sidebarHeaderChildren={
          <BreadcrumbNav
            collapseIfRoot={true}
            routeTree={routeTree}
          ></BreadcrumbNav>
        }
        sx={{
          pt: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </AppletWrapper>
    </SidebarBoundary>
  )
}

export default layoutClient
