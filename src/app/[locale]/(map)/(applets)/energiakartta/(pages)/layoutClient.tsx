'use client'

import React from 'react'

import { routeTree } from '../common/routes'
import { Sidebar, SidebarHeader } from '#/components/Sidebar'
import { BreadcrumbNav } from '#/components/Sidebar'
import AppletWrapper from '#/components/common/AppletWrapper'
import { listedLayerGroups } from '../common/constants'

const localizationNamespace = 'energiakartta'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletWrapper
      mapContext={'energiakartta'}
      localizationNamespace={localizationNamespace}
      isNavbarHidden={true}
      listedLayerGroups={listedLayerGroups}
      sx={{
        pt: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Sidebar
        // sx={{ width: '30rem' }}
        headerElement={
          <SidebarHeader title={'Energiakartta'}>
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

export default layoutClient
