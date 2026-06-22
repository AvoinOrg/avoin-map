'use client'

import React, { useMemo, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'

import useStore from '#/common/hooks/useStore'
import { SidebarContentBox } from '#/components/Sidebar'
import { Box, type AppSystemStyleObject } from '#/common/style/theme'
import { useMapStore } from '#/common/store'
import { getRoute } from '#/common/routing/routing-client'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import IconTextButton from '#/components/common/IconTextButton'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import { routeTree } from '#/common/routing/routes/hiilikartta'
import PlanListItem from '#/app/[locale]/(map)/(applets)/hiilikartta/components/PlanListItem'
import {
  CreationPlaceholderPlanConf,
  NewPlanConf,
  PlanData,
  ZONING_CODE_COL,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import PlanListItemLoading from '#/app/[locale]/(map)/(applets)/hiilikartta/components/PlanListItemLoading'
import { createLayerConf } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import { getVisiblePlanConfs } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/planVisibility'
import PlanOutlineIcon from '#/app/[locale]/(map)/(applets)/hiilikartta/components/PlanOutlineIcon'
import TText from '#/components/common/TText'

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a'
const IMPORT_PLAN_ICON_SRC =
  '/files/img/hiilikartta/sidebar/kaavat-action-upload.svg'
const DRAW_PLAN_ICON_SRC =
  '/files/img/hiilikartta/sidebar/kaavat-action-draw.svg'
const RouteImage = Box as unknown as React.ComponentType<
  React.ComponentProps<'img'> & { component?: 'img'; sx?: AppSystemStyleObject }
>

type PlanListEntry =
  | {
      kind: 'plan'
      created: number
      id: string
      name: string
      calculationState: NonNullable<
        ReturnType<typeof getVisiblePlanConfs>[number]
      >['calculationState']
    }
  | {
      kind: 'creation-placeholder'
      created: number
      id: string
      name: string
    }

const getCreationPlaceholderDisplayName = ({
  creationPlaceholderPlanConf,
  t,
}: {
  creationPlaceholderPlanConf: CreationPlaceholderPlanConf
  t: (key: string) => string
}) => {
  const trimmedName = creationPlaceholderPlanConf.name?.trim()

  if (trimmedName) {
    return trimmedName
  }

  return t('sidebar.my_plans.imported_plan_name')
}

const Page = () => {
  const { t } = useTranslate('hiilikartta')
  const router = useRouter()
  const [sortOrder, setSortOrder] = useState<SortOption>('newest')
  const planConfs = useStore(useAppletStore, (state) => state.planConfs)
  const placeholderPlanConfs = useStore(
    useAppletStore,
    (state) => state.placeholderPlanConfs
  )
  const creationPlaceholderPlanConfs = useStore(
    useAppletStore,
    (state) => state.creationPlaceholderPlanConfs
  )
  const addPlanConf = useAppletStore((state) => state.addPlanConf)
  const addCreationPlaceholderPlanConf = useAppletStore(
    (state) => state.addCreationPlaceholderPlanConf
  )
  const deletePlanConf = useAppletStore((state) => state.deletePlanConf)
  const addSerializableLayerGroup = useMapStore(
    (state) => state.addSerializableLayerGroup
  )

  const sortedPlanEntries = useMemo(() => {
    const visiblePlanConfs = getVisiblePlanConfs(planConfs ?? undefined)
    const creationPlaceholderEntries = Object.values(
      creationPlaceholderPlanConfs ?? {}
    ).map(
      (creationPlaceholderPlanConf): PlanListEntry => ({
        kind: 'creation-placeholder',
        created: creationPlaceholderPlanConf.created,
        id: creationPlaceholderPlanConf.id,
        name: getCreationPlaceholderDisplayName({
          creationPlaceholderPlanConf,
          t,
        }),
      })
    )

    const sorted: PlanListEntry[] = [
      ...visiblePlanConfs.map((planConf) => ({
        kind: 'plan' as const,
        created: planConf.created,
        id: planConf.id,
        name: planConf.name,
        calculationState: planConf.calculationState,
      })),
      ...creationPlaceholderEntries,
    ]

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
  }, [creationPlaceholderPlanConfs, planConfs, sortOrder, t])

  const hasPlansSection =
    sortedPlanEntries.length > 0 ||
    Object.keys(placeholderPlanConfs ?? {}).length > 0

  const handleSortChange = (event: DropDownValueChangeEvent) => {
    setSortOrder(event.target.value as SortOption)
  }

  const visiblePlanCount = sortedPlanEntries.length
  const visiblePlanCountLabel = t('sidebar.my_plans.count', {
    count: visiblePlanCount,
  })

  const handleImportClick = async () => {
    const creationPlaceholderPlanConf =
      await addCreationPlaceholderPlanConf()

    router.push(
      getRoute({
        routeNode: routeTree.plans.plan,
        routeTree,
        params: {
          routeParams: {
            planId: creationPlaceholderPlanConf.id,
          },
        },
      })
    )
  }

  const handleDrawClick = async () => {
    const jsonName = t('sidebar.plan_flow.new_plan_name')
    const data: PlanData = {
      type: 'FeatureCollection',
      features: [],
    }

    const newPlanConf: NewPlanConf = {
      data,
      name: jsonName,
      areaHa: 0,
      draftType: 'draw',
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
    <SidebarContentBox
      scrollFadeColor="#ffffff"
      sxInner={{
        pt: 0,
        gap: { mobile: '1.5rem', desktop: '1.5rem' },
        px: { mobile: '1rem', desktop: '1.875rem' },
        pb: { mobile: '1.25rem', desktop: '1.5rem' },
        backgroundColor: '#ffffff',
      }}
    >
      <SidebarBackgroundContent
        imageSrc="/files/img/hiilikartta/sidebar/kaavat-hero.png"
        imageAlt="Hiilikartta kaavat"
        title={<TText keyName="sidebar.kaavat.title" ns="hiilikartta" />}
        description={<TText keyName="sidebar.kaavat.description" ns="hiilikartta" />}
        imageSx={{
          height: '5.625rem',
          objectPosition: 'center 35%',
        }}
        contentSx={{
          px: '2.4375rem',
          pt: '4.375rem',
          pb: '4.6875rem',
          gap: '3.75rem',
        }}
        headerSx={{
          gap: '2.1875rem',
        }}
        descriptionSx={{
          width: '100%',
          maxWidth: 'none',
        }}
        actionsSx={{
          gap: '1.75rem',
        }}
        actions={
          <>
            <IconTextButton
              icon={
                <RouteImage
                  component="img"
                  src={IMPORT_PLAN_ICON_SRC}
                  alt=""
                  aria-hidden="true"
                  sx={{
                    width: '0.75rem',
                    height: '0.90625rem',
                    display: 'block',
                  }}
                />
              }
              text={
                <TText keyName="sidebar.plan_flow.import_title" ns="hiilikartta" />
              }
              helperText={t('sidebar.create.upload_info')}
              helperAriaLabel="Show plan import information"
              onClick={handleImportClick}
            />
            <IconTextButton
              icon={
                <RouteImage
                  component="img"
                  src={DRAW_PLAN_ICON_SRC}
                  alt=""
                  aria-hidden="true"
                  sx={{
                    width: '1.0125rem',
                    height: '0.75rem',
                    display: 'block',
                  }}
                />
              }
              text={
                <TText
                  keyName="sidebar.plan_flow.draw_plan_action"
                  ns="hiilikartta"
                />
              }
              helperText={t('sidebar.create.draw_new_info')}
              helperAriaLabel="Show drawing instructions"
              onClick={handleDrawClick}
            />
          </>
        }
      />

      {hasPlansSection && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { mobile: '1rem', desktop: '1.125rem' },
            p: { mobile: '1rem', desktop: '1.25rem' },
            borderRadius: '1.25rem',
            backgroundColor: '#f4f4f4',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Box
              component="p"
              sx={{
                color: '#111111',
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                lineHeight: '1.125rem',
                textTransform: 'uppercase',
                m: 0,
              }}
            >
              <TText keyName="sidebar.my_plans.title" ns="hiilikartta" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#111111',
              }}
            >
              <PlanOutlineIcon
                variant="large"
                sx={{
                  color: '#0D6044',
                  flexShrink: 0,
                }}
              />
              <Box
                component="span"
                sx={{
                  color: '#111111',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  lineHeight: '1.125rem',
                  m: 0,
                }}
              >
                {visiblePlanCountLabel}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              backgroundColor: '#f4f4f4',
              boxShadow: 'inset -1px -1px 6px 0 #dfdfdf',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                pb: '1.2rem',
                backgroundColor: '#f4f4f4',
                boxShadow: '0px 1px 1px 0px rgba(189, 189, 189, 0.25)',
              }}
            >
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
                  minWidth: '7.25rem',
                  ml: 'auto',
                  borderRadius: '999px',
                  backgroundColor: '#d9d9d9',
                  boxShadow: '0px 1px 1px 0px rgba(189, 189, 189, 0.25)',
                  color: '#111111',
                  '& [data-slot="value"]': {
                    pl: '0.75rem',
                    pr: '1.75rem !important',
                    py: '0.3125rem',
                    fontSize: '0.5rem',
                    fontWeight: 700,
                    lineHeight: '1rem',
                    letterSpacing: '0.1em',
                  },
                  '& [data-slot="icon"]': {
                    right: '0.625rem',
                    top: 'calc(50% - 0.21875rem)',
                    width: '0.6875rem',
                    height: '0.4375rem',
                  },
                }}
                optionSx={{
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  lineHeight: '1rem',
                  letterSpacing: '0.1em',
                  pl: 1.5,
                  pr: 1,
                }}
                iconSx={{
                  mt: 0,
                  mr: 0,
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                px: { mobile: '1.125rem', desktop: '1.25rem' },
                pb: { mobile: '1rem', desktop: '1.125rem' },
                pt: 0,
              }}
            >
              {sortedPlanEntries.map((planEntry) => (
                <Box
                  key={planEntry.id}
                  sx={{
                    width: '100%',
                    borderBottom:
                      '1px solid rgba(13, 96, 68, 0.12)',
                    '&:last-of-type': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <PlanListItem
                    planId={planEntry.id}
                    name={planEntry.name}
                    calculationState={
                      planEntry.kind === 'plan'
                        ? planEntry.calculationState
                        : undefined
                    }
                    statusText={
                      planEntry.kind === 'creation-placeholder'
                        ? t('sidebar.my_plans.import_in_progress')
                        : undefined
                    }
                  />
                </Box>
              ))}

              {placeholderPlanConfs &&
                Object.keys(placeholderPlanConfs).map((planConfId) => (
                  <Box
                    key={planConfId}
                    sx={{
                      width: '100%',
                      borderBottom:
                        '1px solid rgba(13, 96, 68, 0.12)',
                      '&:last-of-type': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <PlanListItemLoading />
                  </Box>
                ))}
            </Box>
          </Box>
        </Box>
      )}
    </SidebarContentBox>
  )
}

export default Page
