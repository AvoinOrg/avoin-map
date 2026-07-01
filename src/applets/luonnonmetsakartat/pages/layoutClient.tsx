'use client'

import React from 'react'

import { BreadcrumbNav, SidebarBoundary } from '#/components/Sidebar'
import AppletWrapper from '#/components/common/AppletWrapper'
import { listedLayerGroups } from '../common/constants'
import LuonnonmetsakartatMockScenarioBootstrap from '../common/mockScenarios/LuonnonmetsakartatMockScenarioBootstrap'
import { isLuonnonmetsakartatMockScenariosEnabled } from '../common/mockScenarios/config'

const localizationNamespace = 'luonnonmetsakartat'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const shouldMountMockScenarioBootstrap =
    isLuonnonmetsakartatMockScenariosEnabled()

  return (
    <SidebarBoundary id="luonnonmetsakartat-floating" mode="floating">
      <AppletWrapper
        mapContext={'luonnonmetsakartat'}
        localizationNamespace={localizationNamespace}
        isNavbarHidden={true}
        listedLayerGroups={listedLayerGroups}
        sidebarHeaderTitle={'Luonnonmetsäkartat'}
        sidebarHeaderChildren={
          <BreadcrumbNav collapseIfRoot={true}></BreadcrumbNav>
        }
        sx={{
          pt: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {shouldMountMockScenarioBootstrap ? (
          <LuonnonmetsakartatMockScenarioBootstrap />
        ) : null}
        {children}
      </AppletWrapper>
    </SidebarBoundary>
  )
}

export default layoutClient
