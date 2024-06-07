'use client'

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { T } from '@tolgee/react'

import { Folder } from '#/components/common/Folder'
import { SidebarContentBox } from '#/components/Sidebar'
import useStore from '#/common/hooks/useStore'
import MutableLink from '#/components/common/MutableLink'

import { routeTree } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/routes'
import { useAppletStore } from '../state/appletStore'
import { GlobalState, PlanConf, PlanConfState } from '../common/types'
import { LoadingSpinner } from '#/components/Loading'

const Page = () => {
  const planConfs = useStore(useAppletStore, (state) => state.planConfs)
  const globalState = useStore(useAppletStore, (state) => state.globalState)

  const filteredPlanConfs: PlanConf[] = useMemo(() => {
    if (planConfs == null) {
      return []
    }

    return Object.keys(planConfs).reduce<PlanConf[]>((acc, id) => {
      if (
        !planConfs[id].isHidden &&
        planConfs[id].state !== PlanConfState.FETCHING
      ) {
        acc.push(planConfs[id])
      }

      return acc
    }, [])
  }, [planConfs])

  return (
    <SidebarContentBox>
      <MutableLink route={routeTree.create} routeTree={routeTree}>
        <Box sx={{ typography: 'h2', textAlign: 'start', mt: 5 }}>
          <T keyName={'sidebar.main.add_new'} ns="hiilikartta"></T>
        </Box>
      </MutableLink>

      {globalState !== GlobalState.IDLE && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            mt: 19,
          }}
        >
          <LoadingSpinner
            sx={{ height: '40px', color: 'secondary.main' }}
          ></LoadingSpinner>
        </Box>
      )}

      {filteredPlanConfs.length > 0 && globalState === GlobalState.IDLE && (
        <MutableLink
          route={routeTree.plans}
          routeTree={routeTree}
          sx={{ mt: 18 }}
        >
          <Folder
            sx={{
              color: 'neutral.lighter',
              backgroundColor: 'primary.dark',
              borderColor: 'primary.light',
              pt: 6,
              pl: 4,
            }}
          >
            <Typography variant="h2" sx={{ textTransform: 'uppercase' }}>
              <T keyName={'sidebar.my_plans.title'} ns={'hiilikartta'}></T>
            </Typography>
          </Folder>
        </MutableLink>
      )}
    </SidebarContentBox>
  )
}

export default Page
