'use client'

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { T } from '@tolgee/react'

import { Folder } from '#/components/common/Folder'
import { SidebarContentBox } from '#/components/Sidebar'
import useStore from '#/common/hooks/useStore'
import MutableLink from '#/components/common/MutableLink'

import { routeTree } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/routes'
import { useAppletStore } from '../state/appletStore'
import { GlobalState, PlanConf, PlanConfState } from '../common/types'
import { LoadingSpinner } from '#/components/Loading'

const Page = () => {
  // const planConfs = useStore(useAppletStore, (state) => state.planConfs)
  // const globalState = useStore(useAppletStore, (state) => state.globalState)

  // const filteredPlanConfs: PlanConf[] = useMemo(() => {
  //   if (planConfs == null) {
  //     return []
  //   }

  //   return Object.keys(planConfs).reduce<PlanConf[]>((acc, id) => {
  //     if (
  //       !planConfs[id].isHidden &&
  //       planConfs[id].state !== PlanConfState.FETCHING
  //     ) {
  //       acc.push(planConfs[id])
  //     }

  //     return acc
  //   }, [])
  // }, [planConfs])

  return (
    <SidebarContentBox>
      <></>
    </SidebarContentBox>
  )
}

export default Page
