// Client-side layout for the Hiilikartta applet; coordinates session state,
// plan sync, and the shared map UI shell.
'use client'

import React, { useEffect } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'

import { useAuthSession } from '#/common/auth'
import { useAppParams, useAppPathname } from '#/common/navigation/navigation'
import {
  compiledApplets,
  getPathnameWithoutLocale,
} from '#/common/routing/appletBuildMode'
import AppletWrapper from '#/components/common/AppletWrapper'
import BreadcrumbNav from '#/components/Sidebar/BreadcrumbNav'
import { useUserStore } from '#/common/store/userStore'

import HiilikarttaMockScenarioBootstrap from '../common/mockScenarios/HiilikarttaMockScenarioBootstrap'
import { isHiilikarttaMockScenariosEnabled } from '../common/mockScenarios/config'
import { listedLayerGroups } from '../common/constants'
import { usePlanStatsQuery } from '../common/queries/planStatsQuery'
import { usePlanQueries } from '../common/queries/planQueries'
import { useAppletStore } from '../state/appletStore'
import {
  PlanConfState,
  PlaceholderPlanConf,
  GlobalState,
} from '../common/types'
import { getZoningClasses } from '../common/zoningClasses'

const localizationNamespace = 'hiilikartta'

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useAuthSession()
  const accessToken = session?.accessToken
  const pathname = useAppPathname()
  const { locale } = useAppParams()
  const addSignOutAction = useUserStore((state) => state.addSignOutAction)
  const removeSignOutAction = useUserStore((state) => state.removeSignOutAction)

  const deletePlanConf = useAppletStore((state) => state.deletePlanConf)
  const updateGlobalState = useAppletStore((state) => state.updateGlobalState)
  const planConfs = useAppletStore((state) => state.planConfs)
  const updatePlanConf = useAppletStore((state) => state.updatePlanConf)
  const addPlaceholderPlanConf = useAppletStore(
    (state) => state.addPlaceholderPlanConf
  )
  const clearPlaceholderPlanConfs = useAppletStore(
    (state) => state.clearPlaceholderPlanConfs
  )

  const [planConfsToFetch, setPlanConfsToFetch] = React.useState<
    PlaceholderPlanConf[]
  >([])
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname, locale ?? null)
  const isStandaloneHiilikartta =
    compiledApplets.length === 1 && compiledApplets[0] === 'hiilikartta'
  const isHiilikarttaRoot =
    pathnameWithoutLocale === '/carbon' ||
    (isStandaloneHiilikartta && pathnameWithoutLocale === '/')
  const isHiilikarttaKaavat =
    pathnameWithoutLocale.startsWith('/carbon/plans') ||
    pathnameWithoutLocale.startsWith('/plans')
  const showBreadcrumbNav = !isHiilikarttaRoot && !isHiilikarttaKaavat

  const planConfStatsQuery = useQuery({
    ...usePlanStatsQuery(),
    enabled: false,
  })

  const planQs = useQueries(usePlanQueries(planConfsToFetch))

  // Plan conf hydration flow:
  // 1) sync session -> local plans + fetch stats
  // 2) decide which plans to fetch based on server stats
  // 3) kick off per-plan fetches and clear loading state when done
  useEffect(() => {
    if (status === 'loading') {
      updateGlobalState(GlobalState.INITIALIZING)
      return
    }

    clearPlaceholderPlanConfs()

    if (session?.user?.id != null) {
      clearPlaceholderPlanConfs()
      updateGlobalState(GlobalState.INITIALIZING)

      if (accessToken) {
        planConfStatsQuery.refetch()
      } else {
        updateGlobalState(GlobalState.IDLE)
      }

      for (const id in planConfs) {
        if (!planConfs[id].userId) {
          updatePlanConf(id, { userId: session.user.id })
        } else if (planConfs[id].userId !== session.user.id) {
          updatePlanConf(id, { isHidden: true })
        } else if (planConfs[id].userId === session.user.id) {
          updatePlanConf(id, { isHidden: false })
        }
      }
    } else {
      for (const id in planConfs) {
        if (planConfs[id].userId != null) {
          updatePlanConf(id, { isHidden: true })
        }
      }
      updateGlobalState(GlobalState.IDLE)
    }
  }, [accessToken, session?.user?.id, status])

  useEffect(() => {
    const processPlanConfs = async (data: PlaceholderPlanConf[]) => {
      const filteredPlanConfs = []
      for (const placeholderPlanConf of data) {
        if (
          !Object.keys(planConfs).includes(placeholderPlanConf.id) ||
          (planConfs[placeholderPlanConf.id].localLastEdited != null &&
            (planConfs[placeholderPlanConf.id].localLastEdited ?? 0) <
              placeholderPlanConf.cloudLastSaved)
        ) {
          await addPlaceholderPlanConf(
            placeholderPlanConf.id,
            placeholderPlanConf
          )
          if (Object.keys(planConfs).includes(placeholderPlanConf.id)) {
            await updatePlanConf(placeholderPlanConf.id, {
              state: PlanConfState.FETCHING,
            })
          }

          filteredPlanConfs.push(placeholderPlanConf)
        }
      }

      setPlanConfsToFetch(filteredPlanConfs)

      if (filteredPlanConfs.length > 0) {
        updateGlobalState(GlobalState.FETCHING)
      } else {
        updateGlobalState(GlobalState.IDLE)
      }
    }

    if (session?.user?.id && planConfStatsQuery.data) {
      if (planConfStatsQuery.data.length > 0) {
        processPlanConfs(planConfStatsQuery.data)
      } else {
        updateGlobalState(GlobalState.IDLE)
      }
    }
  }, [session?.user?.id, planConfStatsQuery.data])

  useEffect(() => {
    if (session?.user?.id && planConfsToFetch) {
      if (planConfsToFetch.length > 0) {
        planQs.forEach((planQ) => {
          planQ.refetch()
        })
      }
    }
  }, [session?.user?.id, planConfsToFetch])

  useEffect(() => {
    if (planQs.length > 0) {
      const allCompleted = planQs.every(
        (planQ) => planQ.isSuccess || planQ.isError
      )

      if (allCompleted) {
        updateGlobalState(GlobalState.IDLE)
      }
    }
  }, [planQs])

  // Register sign-out cleanup so user-owned plans are cleared on logout.
  useEffect(() => {
    if (session?.user?.id != null) {
      addSignOutAction('hiilikartta', () => {
        for (const id in planConfs) {
          if (planConfs[id].userId === session?.user?.id) {
            deletePlanConf(id)
          }
        }
      })
    }
  }, [planConfs, session?.user?.id])

  useEffect(() => {
    // Preload zoning classes on applet load
    getZoningClasses().catch(() => {})

    return () => {
      removeSignOutAction('hiilikartta')
    }
  }, [])

  const shouldMountMockScenarioBootstrap = isHiilikarttaMockScenariosEnabled()

  return (
    <AppletWrapper
      mapContext={'hiilikartta'}
      localizationNamespace={localizationNamespace}
      listedLayerGroups={listedLayerGroups}
      sidebarHeaderTitle={'Hiilikartta'}
      sidebarHeaderBackgroundImage={'/files/img/hiilikartta/zoning.jpg'}
      sidebarHeaderChildren={
        showBreadcrumbNav ? <BreadcrumbNav collapseIfRoot /> : undefined
      }
      sx={{
        pt: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {shouldMountMockScenarioBootstrap ? (
        <HiilikarttaMockScenarioBootstrap />
      ) : null}
      {children}
    </AppletWrapper>
  )
}

export default LayoutClient
