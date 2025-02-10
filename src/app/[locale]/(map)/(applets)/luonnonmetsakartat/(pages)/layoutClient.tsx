'use client'

import React, { useEffect } from 'react'
import { Box } from '@mui/material'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { routeTree } from '../common/routes'
import { Sidebar, SidebarHeader } from '#/components/Sidebar'
import { BreadcrumbNav } from '#/components/Sidebar'
import AppletWrapper from '#/components/common/AppletWrapper'
import { useUserStore } from '#/common/store/userStore'

import { planStatsQuery } from '../common/queries/planStatsQuery'
import { planQueries } from '../common/queries/planQueries'
import { useAppletStore } from '../state/appletStore'
import {
  PlanConfState,
  PlaceholderPlanConf,
  GlobalState,
} from '../common/types'

const localizationNamespace = 'luonnonmetsakartat'
const defaultLanguage = 'fi'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletWrapper
      mapContext={'luonnonmetsakartat'}
      localizationNamespace={localizationNamespace}
      defaultLanguage={defaultLanguage}
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
            <Box sx={{ mt: 8, width: '100%' }}>
              <BreadcrumbNav routeTree={routeTree}></BreadcrumbNav>
            </Box>
          </SidebarHeader>
        }
      >
        {children}
      </Sidebar>
    </AppletWrapper>
  )
}

export default layoutClient
