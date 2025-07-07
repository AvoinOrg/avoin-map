'use client'

import React from 'react'
import { Box } from '@mui/material'

import { routeTree } from '../common/routes'
import { Sidebar, SidebarHeader } from '#/components/Sidebar'
import { BreadcrumbNav } from '#/components/Sidebar'
import AppletWrapper from '#/components/common/AppletWrapper'

const localizationNamespace = 'luonnonmetsakartat'
const defaultLanguage = 'fi'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletWrapper
      mapContext={'luonnonmetsakartat'}
      localizationNamespace={localizationNamespace}
      defaultLanguage={defaultLanguage}
      isNavbarHidden={true}
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
