'use client'

import React, { useMemo, useState } from 'react'
import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'

import useStore from '#/common/hooks/useStore'
import { SidebarContentBox } from '#/components/Sidebar'
import { useMapStore } from '#/common/store'
import { getRoute } from '#/common/routing/routing-client'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import IconTextButton from '#/components/common/IconTextButton'
import Upload from '#/components/icons/Upload'
import FountainPen from '#/components/icons/FountainPen'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import { routeTree } from '#/common/routing/routes/hiilikartta'
import PlanFolder from '#/app/[locale]/(map)/(applets)/hiilikartta/components/PlanFolder'
import {
  NewPlanConf,
  PlanData,
  ZONING_CODE_COL,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import PlanFolderLoading from '#/app/[locale]/(map)/(applets)/hiilikartta/components/PlanFolderLoading'
import { createLayerConf } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import { getVisiblePlanConfs } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/planVisibility'

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a'

const Page = () => {
  const { t } = useTranslate('hiilikartta')
  const router = useRouter()
  const [sortOrder, setSortOrder] = useState<SortOption>('newest')
  const planConfs = useStore(useAppletStore, (state) => state.planConfs)
  const placeholderPlanConfs = useStore(
    useAppletStore,
    (state) => state.placeholderPlanConfs
  )
  const addPlanConf = useAppletStore((state) => state.addPlanConf)
  const deletePlanConf = useAppletStore((state) => state.deletePlanConf)
  const addSerializableLayerGroup = useMapStore(
    (state) => state.addSerializableLayerGroup
  )

  const sortedPlanConfs = useMemo(() => {
    const visiblePlanConfs = getVisiblePlanConfs(planConfs)

    const sorted = [...visiblePlanConfs]

    sorted.sort((firstPlanConf, secondPlanConf) => {
      switch (sortOrder) {
        case 'oldest':
          return firstPlanConf.created - secondPlanConf.created
        case 'a-z':
          return firstPlanConf.name.localeCompare(secondPlanConf.name, 'fi')
        case 'z-a':
          return secondPlanConf.name.localeCompare(firstPlanConf.name, 'fi')
        case 'newest':
        default:
          return secondPlanConf.created - firstPlanConf.created
      }
    })

    return sorted
  }, [planConfs, sortOrder])

  const hasPlansSection =
    sortedPlanConfs.length > 0 ||
    Object.keys(placeholderPlanConfs ?? {}).length > 0

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value as SortOption)
  }

  const handleImportClick = () => {
    router.push(getRoute({ routeNode: routeTree.create.import, routeTree }))
  }

  const handleDrawClick = async () => {
    const jsonName = 'Uusi kaava'
    const data: PlanData = {
      type: 'FeatureCollection',
      features: [],
    }

    const newPlanConf: NewPlanConf = {
      data,
      name: jsonName,
      areaHa: 0,
    }

    const planConf = await addPlanConf(newPlanConf)

    try {
      const layerConf = await createLayerConf(data, planConf.id, ZONING_CODE_COL)
      await addSerializableLayerGroup(layerConf.id, {
        layerConf,
        persist: false,
      })
    } catch (error) {
      deletePlanConf(planConf.id)
      console.error(error)
      return
    }

    router.push(
      getRoute({
        routeNode: routeTree.plans.plan,
        routeTree,
        params: {
          routeParams: {
            planId: planConf.id,
          },
        },
      })
    )
  }

  return (
    <SidebarContentBox sxInner={{ pt: 0, gap: 3 }}>
      <SidebarBackgroundContent
        imageSrc="/files/img/hiilikartta/zoning.jpg"
        imageAlt="Hiilikartta kaavat"
        title={<T keyName="sidebar.kaavat.title" ns="hiilikartta" />}
        description={<T keyName="sidebar.kaavat.description" ns="hiilikartta" />}
        actions={
          <>
            <IconTextButton
              icon={<Upload />}
              text={<T keyName="sidebar.create.upload" ns="hiilikartta" />}
              helperText={t('sidebar.create.upload_info')}
              helperAriaLabel="Show plan import information"
              onClick={handleImportClick}
            />
            <IconTextButton
              icon={<FountainPen />}
              text={<T keyName="sidebar.create.draw_new" ns="hiilikartta" />}
              helperText={t('sidebar.create.draw_new_info')}
              helperAriaLabel="Show drawing instructions"
              onClick={handleDrawClick}
            />
          </>
        }
      />

      {hasPlansSection && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: { mobile: 'stretch', desktop: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              flexDirection: { mobile: 'column', desktop: 'row' },
            }}
          >
            <Typography sx={{ typography: 'h2', color: 'neutral.darker' }}>
              <T keyName="sidebar.my_plans.title" ns="hiilikartta" />
            </Typography>
            <DropDownSelectMinimal
              value={sortOrder}
              onChange={handleSortChange}
              ariaLabel={t('sidebar.kaavat.sort_label')}
              options={[
                {
                  value: 'newest',
                  label: t('sidebar.kaavat.sort_newest'),
                },
                {
                  value: 'oldest',
                  label: t('sidebar.kaavat.sort_oldest'),
                },
                {
                  value: 'a-z',
                  label: t('sidebar.kaavat.sort_a_z'),
                },
                {
                  value: 'z-a',
                  label: t('sidebar.kaavat.sort_z_a'),
                },
              ]}
              sx={{
                typography: 'body2',
                color: 'neutral.dark',
                alignSelf: { mobile: 'flex-start', desktop: 'center' },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sortedPlanConfs.map((planConf) => (
              <Box
                key={planConf.id}
                component="button"
                type="button"
                aria-label={`Open plan ${planConf.name}`}
                onClick={() =>
                  router.push(
                    getRoute({
                      routeNode: routeTree.plans.plan,
                      routeTree,
                      params: { routeParams: { planId: planConf.id } },
                    })
                  )
                }
                sx={{
                  p: 0,
                  m: 0,
                  width: '100%',
                  border: 'none',
                  background: 'none',
                  textAlign: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <PlanFolder planConf={planConf} height={120} />
              </Box>
            ))}

            {placeholderPlanConfs &&
              Object.keys(placeholderPlanConfs).map((planConfId) => (
                <Box key={planConfId}>
                  <PlanFolderLoading
                    planConf={placeholderPlanConfs[planConfId]}
                    height={120}
                  />
                </Box>
              ))}
          </Box>
        </Box>
      )}
    </SidebarContentBox>
  )
}

export default Page
