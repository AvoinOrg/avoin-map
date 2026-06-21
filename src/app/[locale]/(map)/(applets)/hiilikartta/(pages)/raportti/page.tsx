'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import useStore from '#/common/hooks/useStore'
import MutableLink from '#/components/common/MutableLink'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { map, isEqual } from 'lodash-es'
import { useTranslate } from '@tolgee/react'

import { Box, toSxArray, type AppSxProps } from '#/common/style/theme'
import { getRoute } from '#/common/routing/routing-client'
import { ButtonBase } from '#/components/common/Button'
import MultiSelectAutocomplete from '#/components/common/MultiSelectAutocomplete'
import { FullscreenPage } from '#/components/common/FullscreenPage'
import { SidebarBoundary } from '#/components/Sidebar'
import { FetchStatus, SelectOption } from '#/common/types/general'
import { Download as DownloadIcon, Link as LinkIcon } from '#/components/icons'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import { routeTree } from '#/common/routing/routes/hiilikartta'
import {
  GlobalState,
  PlanConfWithReportData,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import CarbonMapGraph from '#/app/[locale]/(map)/(applets)/hiilikartta/components/CarbonMapGraph'
import { CarbonLineChart } from '#/app/[locale]/(map)/(applets)/hiilikartta/components/CarbonLineChart'
import CarbonOverviewGraph from '#/app/[locale]/(map)/(applets)/hiilikartta/components/CarbonOverviewGraph'
import ClipboardCopyWrapper from '#/components/common/ClipboardCopyWrapper'
import { LoadingSpinner } from '#/components/Loading'
import { useUIStore } from '#/common/store'
import { getReportCalculatedDate } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import TText from '#/components/common/TText'

const MAX_WIDTH = '1000px'

enum ErrorState {
  NO_IDS = 'NO_IDS',
  INVALID_IDS = 'INVALID_IDS',
  NO_DATA = 'NO_DATA',
}

const Page = () => {
  const searchParams = useSearchParams()
  const globalState = useStore(useAppletStore, (state) => state.globalState)
  const notify = useUIStore((state) => state.notify)
  const router = useRouter()
  const pathName = usePathname()
  const { t } = useTranslate('hiilikartta')
  const addedExtPlanConfIds = useRef<string[]>([])

  const allPlanConfs = useStore(useAppletStore, (state) => state.planConfs)
  const placeholderPlanConfs = useStore(
    useAppletStore,
    (state) => state.placeholderPlanConfs
  )
  const externalPlanConfs = useStore(
    useAppletStore,
    (state) => state.externalPlanConfs
  )
  const addExternalPlanConf = useAppletStore(
    (state) => state.addExternalPlanConf
  )

  const [planConfs, setPlanConfs] = useState<PlanConfWithReportData[]>([])
  const [prevPageId, setPrevPageId] = useState<string>()
  const [prevPageStep, setPrevPageStep] = useState<'plan' | 'areas'>('plan')
  const [, setErrorState] = useState<ErrorState>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [featureYears, setFeatureYears] = useState<string[]>([])

  const planConfSelectOptions = useMemo(() => {
    if (allPlanConfs == null || externalPlanConfs == null) {
      return []
    }

    const combinedPlanConfs = { ...externalPlanConfs, ...allPlanConfs }
    return Object.keys(combinedPlanConfs)
      .filter(
        (id) =>
          combinedPlanConfs[id].serverId != null &&
          combinedPlanConfs[id].reportData != null
      )
      .map((id) => {
        return {
          value: combinedPlanConfs[id]?.serverId,
          label: combinedPlanConfs[id]?.name || combinedPlanConfs[id]?.serverId,
        }
      })
  }, [allPlanConfs, externalPlanConfs])

  /* eslint-disable react-hooks/set-state-in-effect -- The existing report route mirrors URL/store state here while external plans load. */
  useEffect(() => {
    if (
      allPlanConfs != null &&
      externalPlanConfs != null &&
      placeholderPlanConfs != null &&
      globalState === GlobalState.IDLE
    ) {
      const paramPlanIds = searchParams.get('planIds')
      if (paramPlanIds != null) {
        const ids = paramPlanIds.split(',')

        const paramPlanConfs: PlanConfWithReportData[] = []
        for (const id of ids) {
          const foundPlanConfId = Object.keys(allPlanConfs).find(
            (planConfId) => {
              if (
                allPlanConfs[planConfId].serverId === id &&
                !allPlanConfs[planConfId].isHidden
              ) {
                return true
              }
              return false
            }
          )
          const foundExtPlanConfId = Object.keys(externalPlanConfs).find(
            (planConfId) => externalPlanConfs[planConfId].serverId === id
          )
          const foundPhPlanConfId = Object.keys(placeholderPlanConfs).find(
            (planConfId) => placeholderPlanConfs[planConfId].serverId === id
          )

          if (foundPlanConfId != null) {
            if (allPlanConfs[foundPlanConfId].reportData != null) {
              paramPlanConfs.push(
                allPlanConfs[foundPlanConfId] as PlanConfWithReportData
              )
            } else {
              notify({
                message: `${t(
                  'report.error.no_report_data_found_for_plan_with_id'
                )} ${id}`,
                variant: 'error',
              })
              setErrorState(ErrorState.NO_DATA)
            }
          } else if (foundExtPlanConfId != null) {
            if (externalPlanConfs[id].status === FetchStatus.FETCHED) {
              if (externalPlanConfs[foundExtPlanConfId].reportData != null) {
                paramPlanConfs.push(
                  externalPlanConfs[
                    foundExtPlanConfId
                  ] as PlanConfWithReportData
                )
              } else {
                notify({
                  message: `${t(
                    'report.error.no_report_data_found_for_plan_with_id'
                  )} ${id}`,
                  variant: 'error',
                })
                setErrorState(ErrorState.NO_DATA)
              }
            } else if (externalPlanConfs[id].status === FetchStatus.ERRORED) {
              notify({
                message: `${t(
                  'report.error.unable_to_find_plan_with_id'
                )} ${id}`,
                variant: 'error',
              })
              setErrorState(ErrorState.NO_DATA)
            }
          } else if (foundPhPlanConfId != null) {
            if (
              placeholderPlanConfs[foundPhPlanConfId].status != null &&
              placeholderPlanConfs[foundPhPlanConfId].status ===
                FetchStatus.ERRORED
            ) {
              notify({
                message: `${t(
                  'report.error.unable_to_find_plan_with_id'
                )} ${id}`,
                variant: 'error',
              })
              setErrorState(ErrorState.NO_DATA)
            }
          } else if (!addedExtPlanConfIds.current.includes(id)) {
            addedExtPlanConfIds.current.push(id)
            addExternalPlanConf(id)
          }
        }
        const areIdsEqualAndInOrder = isEqual(
          map(planConfs, 'id'),
          map(paramPlanConfs, 'id')
        )

        if (!areIdsEqualAndInOrder) {
          setPlanConfs(paramPlanConfs)

          for (const planConf of paramPlanConfs) {
            const allFeatureYears: string[][] = []
            if (planConf.reportData.metadata.featureYears != null) {
              allFeatureYears.push(planConf.reportData.metadata.featureYears)
            }
            const commonFeatureYears = allFeatureYears[0].filter(
              (item: string) =>
                allFeatureYears.every((featureYearArray: string[]) =>
                  featureYearArray.includes(item)
                )
            )
            setFeatureYears(commonFeatureYears)
          }
        }

        if (!isLoaded) {
          let newLoaded = true

          for (const id of ids) {
            if (
              Object.keys(allPlanConfs).find(
                (key) => allPlanConfs[key].serverId === id
              ) == null &&
              Object.keys(placeholderPlanConfs).find(
                (key) => placeholderPlanConfs[key].serverId === id
              ) == null &&
              externalPlanConfs[id] == null
            ) {
              newLoaded = false
              break
            }
          }

          if (newLoaded) {
            setIsLoaded(true)
          }
        }
      }

      const paramPrevPageId = searchParams.get('prevPageId')
      const paramPrevPageStep = searchParams.get('prevPageStep')
      if (paramPrevPageId != null) {
        if (allPlanConfs[paramPrevPageId] != null) {
          setPrevPageId(paramPrevPageId)
          setPrevPageStep(paramPrevPageStep === 'areas' ? 'areas' : 'plan')
        } else {
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.delete('prevPageId')
          newSearchParams.delete('prevPageStep')

          // Use router.replace to update the URL without adding a new history entry
          router.replace(
            getRoute({
              routeNode: routeTree.report,
              routeTree: routeTree,
              params: {
                queryParams: newSearchParams,
              },
            })
          )
        }
      }
    }
  }, [searchParams, allPlanConfs, externalPlanConfs, globalState])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handlePlanSelectClick = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: SelectOption[]
  ) => {
    const newSearchParams = new URLSearchParams(searchParams)
    const valueString = newValue.map((option) => option.value).join(',')
    newSearchParams.set('planIds', valueString)

    // Use router.replace to update the URL without adding a new history entry
    router.replace(
      getRoute({
        routeNode: routeTree.report,
        routeTree: routeTree,
        params: {
          queryParams: newSearchParams,
        },
      })
    )
  }

  const fullUrl = useMemo(() => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('prevPageId')
    newSearchParams.delete('prevPageStep')
    return `${window.location.origin}${pathName}?${newSearchParams.toString()}`
  }, [pathName, searchParams])

  const handleDownloadGeoJson = () => {
    if (planConfs.length === 0) {
      return
    }

    const geoJsonData =
      planConfs.length === 1
        ? planConfs[0].reportData.areas
        : {
            type: 'FeatureCollection',
            features: planConfs.flatMap((planConf) =>
              planConf.reportData.areas.features.map((feature) => ({
                ...feature,
                properties: {
                  ...feature.properties,
                  plan_id: planConf.serverId,
                  plan_name: planConf.name,
                },
              }))
            ),
          }

    const jsonString = JSON.stringify(geoJsonData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const baseName =
      planConfs.length === 1 ? planConfs[0].name : 'hiilikartta-report'
    const safeName = baseName.replace(/[\\/]/g, '-')
    link.href = url
    link.download = `${safeName || 'report'}.geojson`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // useEffect(() => {
  //   const planLayerGroupId = getPlanLayerGroupId(params.planIdSlug)
  //   enableSerializableLayerGroup(planLayerGroupId)
  //   const bounds = getSourceBounds(planLayerGroupId)
  //   if (bounds) {
  //     fitBounds(bounds, { duration: 2000, latExtra: 0.5, lonExtra: 0.5 })
  //   }
  // }, [])

  // useEffect(() => {
  //   setMapLibraryMode('maplibre')
  // }, [])
  return (
    <SidebarBoundary id="hiilikartta-report-none" mode="none">
      <FullscreenPage
        sx={{
          backgroundColor: 'neutral.lighter',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          pb: 20,
          alignItems: 'center',
        }}
      >
        <Section
          sx={{
            backgroundColor: 'primary.dark',
            pt: { mobile: 3, desktop: 10 },
            pb: { mobile: 3, desktop: 4 },
            px: { mobile: 3, desktop: 4 },
          }}
        >
          <Row
            sx={{
              flexDirection: { mobile: 'column-reverse', desktop: 'row' },
              flexWrap: { mobile: 'wrap', desktop: 'nowrap' },
              alignItems: { mobile: 'flex-end', desktop: 'stretch' },
              mb: { mobile: 2, desktop: 0 },
            }}
          >
            <Box
              component="h1"
              sx={{
                m: 0,
                typography: 'h1',
                display: 'inline',
                width: { mobile: '100%', desktop: 'auto' },
                mt: { mobile: 7, desktop: 0 },
              }}
            >
              <TText keyName="report.header.title" ns="hiilikartta" />
            </Box>
            <MutableLink
              route={
                prevPageId != null
                  ? prevPageStep === 'areas'
                    ? routeTree.plans.plan.areas
                    : routeTree.plans.plan
                  : routeTree
              }
              routeTree={routeTree}
              params={
                prevPageId != null
                  ? { routeParams: { planId: prevPageId } }
                  : {}
              }
            >
              <Box
                component="span"
                sx={{
                  typography: 'body1',
                  display: 'inline',
                  color: 'neutral.light',
                  textDecoration: 'underline',
                }}
              >
                <TText keyName="report.header.close" ns="hiilikartta" />
              </Box>
            </MutableLink>
          </Row>
          <Row
            sx={{
              mt: 4,
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <Box
              component="span"
              sx={{
                typography: 'h3',
                lineHeight: '1.375rem',
                display: 'inline-flex',
                maxWidth: '15rem',
                mb: { mobile: 3, desktop: 0 },
              }}
            >
              <TText
                keyName="report.header.compare_with_other_plans"
                ns="hiilikartta"
              />
            </Box>
            <MultiSelectAutocomplete
              sx={{
                width: { mobile: '100%', desktop: '21rem' },
              }}
              value={planConfs.map((planConf) => ({
                value: planConf.serverId,
                label: planConf.name,
              }))}
              options={planConfSelectOptions}
              placeholder={t('report.header.plan_select_placeholder')}
              onChange={handlePlanSelectClick}
            />

            {planConfs.length === 1 && (
              <Col
                sx={{
                  flex: 1,
                  alignItems: 'end',
                  letterSpacing: '0.075rem',
                  color: 'neutral.lighter',
                  mt: { mobile: 3, desktop: 0 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline',
                    typography: 'body7',
                    whiteSpace: 'nowrap',
                    mt: 0.5,
                  }}
                >
                  <TText
                    keyName="report.report_calculated_on"
                    ns="hiilikartta"
                  />
                </Box>
                <Box
                  component="span"
                  sx={{
                    typography: 'body7',
                    display: 'inline',
                  }}
                >
                  {getReportCalculatedDate(
                    planConfs[0].reportData.metadata.timestamp
                  )?.toLocaleDateString(navigator.language)}
                </Box>
              </Col>
            )}
          </Row>
        </Section>
        <Section
          sx={{
            width: '100%',
            backgroundColor: 'primary.light',
            px: { mobile: 3, desktop: 4 },
          }}
        >
          <Row
            sx={{
              justifyContent: 'flex-end',
              alignItems: 'center',
              minHeight: '4.75rem',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: 3,
              }}
            >
              <ButtonBase
                type="button"
                aria-label="Download report data as GeoJSON"
                disabled={planConfs.length === 0}
                onClick={handleDownloadGeoJson}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  columnGap: 1.5,
                  color: 'inherit',
                  textAlign: 'left',
                  '&:hover': {
                    cursor: 'pointer',
                  },
                  '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
                    cursor: 'not-allowed',
                    opacity: 0.6,
                    pointerEvents: 'auto',
                  },
                }}
              >
                <Box component="span" sx={{ display: 'inline-flex' }}>
                  <DownloadIcon sx={{ width: 14, height: 20, mt: '-2px' }} />
                </Box>
                <Box
                  component="span"
                  sx={{
                    typography: 'body7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: '700',
                    textAlign: 'left',
                    minHeight: '2rem',
                  }}
                >
                  <TText keyName="report.download_geojson" ns="hiilikartta" />
                </Box>
              </ButtonBase>
              <ClipboardCopyWrapper
                ariaLabel="Copy report link"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  columnGap: 1.5,
                  textAlign: 'left',
                }}
                textToCopy={fullUrl}
              >
                <Box component="span" sx={{ display: 'inline-flex' }}>
                  <LinkIcon />
                </Box>
                <Box
                  component="span"
                  sx={{
                    typography: 'body7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: '700',
                    textAlign: 'left',
                    minHeight: '2rem',
                  }}
                >
                  <TText keyName="report.copy_link" ns="hiilikartta" />
                </Box>
              </ClipboardCopyWrapper>
            </Box>
          </Row>
        </Section>
        {!isLoaded && (
          <Box
            sx={{
              mt: 18,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <LoadingSpinner size="3rem" />
          </Box>
        )}
        {isLoaded && planConfs.length > 0 && featureYears.length > 0 && (
          <Col sx={{ maxWidth: MAX_WIDTH, p: 3 }}>
            <Section>
              <CarbonOverviewGraph
                planConfs={planConfs}
                featureYears={featureYears}
                sx={{ maxWidth: MAX_WIDTH, width: '100%', mt: 5 }}
              />
            </Section>
            <Breaker
              sx={{ display: { mobile: 'block', desktop: 'none' }, mt: 8 }}
            />

            <Section
              sx={{
                mt: { mobile: 8, desktop: 14 },
                border: { mobile: 'none', desktop: '1px solid' },
                borderColor: { mobile: 'transparent', desktop: 'primary.dark' },
                boxShadow: {
                  mobile: 'none',
                  desktop: '1px 1px 4px 1px rgba(217, 217, 217, 0.50)',
                },
                p: {
                  mobile: 0,
                  desktop: 3,
                },
                borderRadius: '0.3125rem',
              }}
            >
              <Row sx={{ mb: 4 }}>
                <Col>
                  <CarbonMapGraph
                    planConfs={planConfs}
                    featureYears={featureYears}
                  />
                </Col>
              </Row>
            </Section>
            <Section
              sx={{
                mt: { mobile: 4, desktop: 8 },
                border: { mobile: 'none', desktop: '1px solid' },
                borderColor: { mobile: 'transparent', desktop: 'primary.dark' },
                boxShadow: {
                  mobile: 'none',
                  desktop: '1px 1px 4px 1px rgba(217, 217, 217, 0.50)',
                },
                p: {
                  mobile: 0,
                  desktop: 3,
                },
                borderRadius: '0.3125rem',
              }}
            >
              <Row>
                <CarbonLineChart
                  data={planConfs.map((planConf) => planConf.reportData.totals)}
                  featureYears={featureYears}
                  planNames={planConfs.map((planConf) => planConf.name)}
                />
              </Row>
            </Section>
          </Col>
        )}
      </FullscreenPage>
    </SidebarBoundary>
  )
}

type LayoutProps = {
  children?: React.ReactNode
  sx?: AppSxProps
}

const Section = ({ children, sx }: LayoutProps) => (
  <Box
    component="section"
    sx={[
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)

const Breaker = ({ sx }: Omit<LayoutProps, 'children'>) => (
  <Box
    sx={[
      (theme) => ({
        width: '100%',
        borderTop: `3px solid ${theme.palette.primary.light}`,
      }),
      ...toSxArray(sx),
    ]}
  />
)

const Row = ({ children, sx }: LayoutProps) => (
  <Box
    sx={[
      {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: MAX_WIDTH,
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)

const Col = ({ children, sx }: LayoutProps) => (
  <Box
    sx={[
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)

export default Page
