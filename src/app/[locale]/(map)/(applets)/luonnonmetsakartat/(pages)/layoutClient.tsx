'use client'

import React from 'react'

import { routeTree } from '../common/routes'
import { Sidebar, SidebarHeader } from '#/components/Sidebar'
import { BreadcrumbNav } from '#/components/Sidebar'
import AppletWrapper from '#/components/common/AppletWrapper'
import { listedLayerGroups } from '../common/constants'

const localizationNamespace = 'luonnonmetsakartat'
const defaultLanguage = 'fi'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletWrapper
      mapContext={'luonnonmetsakartat'}
      localizationNamespace={localizationNamespace}
      defaultLanguage={defaultLanguage}
      isNavbarHidden={true}
      listedLayerGroups={listedLayerGroups}
      sx={{
        pt: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Sidebar
        sx={{ width: '30rem' }}
        headerElement={
          <SidebarHeader title={'Luonnonmetsäkartat'}>
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
