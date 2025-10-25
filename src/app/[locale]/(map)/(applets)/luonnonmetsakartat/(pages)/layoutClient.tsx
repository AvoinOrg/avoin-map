'use client'

import React from 'react'

import { routeTree } from '../common/routes'
import { BreadcrumbNav } from '#/components/Sidebar'
import AppletWrapper from '#/components/common/AppletWrapper'
import { listedLayerGroups } from '../common/constants'

const localizationNamespace = 'luonnonmetsakartat'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletWrapper
      mapContext={'luonnonmetsakartat'}
      localizationNamespace={localizationNamespace}
      isNavbarHidden={true}
      listedLayerGroups={listedLayerGroups}
      sidebarHeaderTitle={'Luonnonmetsäkartat'}
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
  )
}

export default layoutClient
