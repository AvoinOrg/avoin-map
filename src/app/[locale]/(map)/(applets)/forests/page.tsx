'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { MapGeoJSONFeature } from 'maplibre-gl'

import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import { Box, toSxArray } from '#/common/style/theme'
import type { AppSxProps } from '#/common/style/theme'
import Link from '#/components/common/Link'
import FrameworkImage from '#/components/common/FrameworkImage'
import { IconButton } from '#/components/common/Button'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
// import { setOverlayMessage } from '../../OverlayMessages/OverlayMessages'
// import * as SelectedFeatureState from './ArvometsaSelectedLayer'
import { useMapStore } from '#/common/store'
// import { setSearchPlaceholder } from '../../NavBar/NavBarSearch'
import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'
import useSelectedFeaturesFilteredByLayer from '#/common/hooks/map/useSelectedFeaturesFilteredByLayer'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'
import {
  IntoSidebarPanelExtensionActionRailSlot,
  IntoSidebarPanelExtensionPanelSlot,
  IntoSidebarPanelSlot,
  SidebarPanelExtensionProvider,
  SidebarContentBox,
} from '#/components/Sidebar'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import { useLayerGroup } from '#/common/hooks/map/useLayerGroup'
import Info from '#/components/icons/Info'
import { Star, Cross } from '#/components/icons'

import { useUpdateMapDetails } from './hooks/useUpdateMapDetails'
import { Bar as FinlandForestsChart } from './components/FinlandForestsChart'
import type { BarProps } from './components/FinlandForestsChart'
import {
  getTotals,
  getDatasetAttributes,
  getNpvText,
  getChartProps,
  getUnitPerArea,
} from './utils'
import { layerConf } from './layers/layerConf'
import { ForestryMethod } from './types'
import {
  CO2_TONS_PER_PERSON,
  DEFAULT_FORESTRY_METHOD,
  TRADITIONAL_FORESTRY_METHOD,
  layerOptions,
} from './constants'

import arvometsaLogo from './public/arvometsa_logo.png'
// import * as Analytics from 'src/map/analytics'

type ForestsTooltipSide = React.ComponentProps<
  typeof BaseTooltip.Positioner
>['side']

type ForestsTooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  'color'
> & {
  ref?: React.Ref<HTMLButtonElement>
}

type ForestsTotals = Record<string, number> & {
  area: number
  f_area: number
}

type ForestsChartConfig = {
  chartOptions: BarProps
}

type ForestsOptions = {
  totals: ForestsTotals
  npvText: string
  averageCarbonBalanceText: string
  averageCarbonBalanceOverall: number
  cbt: ForestsChartConfig
  bio: ForestsChartConfig
  wood: ForestsChartConfig
}

type AreaNameParts = {
  label: string
  display: React.ReactNode
}

const graphActionButtonSx = {
  width: '45px',
  minWidth: '45px',
  height: '45px',
  borderRadius: '10px',
  color: 'neutral.darker',
  backgroundColor: '#ffffff',
  boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.18)',
  transition: 'background-color 0.2s, transform 0.2s',
  '&:hover': {
    backgroundColor: '#f4f4f4',
    transform: 'translateY(-1px)',
  },
} as const

const graphChartBoxSx = {
  mt: 3,
  width: 'calc(100% - 0.75rem)',
  maxWidth: '100%',
  ml: 'auto',
  overflow: 'visible',
} as const

const infoTooltipButtonSx = {
  width: 20,
  minWidth: 20,
  height: 20,
  p: 0,
  border: 0,
  borderRadius: '50%',
  color: 'action.active',
  verticalAlign: 'text-bottom',
  '&:hover': {
    backgroundColor: 'transparent',
    color: 'neutral.darker',
  },
} as const

const getForestsTooltipArrowSx = (
  side: ForestsTooltipSide
): AppSxProps => {
  if (side === 'right') {
    return { left: -4, top: 'calc(50% - 4px)' }
  }

  if (side === 'left') {
    return { right: -4, top: 'calc(50% - 4px)' }
  }

  if (side === 'bottom') {
    return { top: -4, left: 'calc(50% - 4px)' }
  }

  return { bottom: -4, left: 'calc(50% - 4px)' }
}

const ForestsTooltip = ({
  title,
  side = 'top',
  children,
}: {
  title: React.ReactNode
  side?: ForestsTooltipSide
  children: (props: ForestsTooltipTriggerProps) => React.ReactElement
}) => (
  <BaseTooltip.Root>
    <BaseTooltip.Trigger
      delay={0}
      closeDelay={0}
      render={(triggerProps) => {
        const {
          color: ignoredColor,
          type: ignoredType,
          ...resolvedTriggerProps
        } = triggerProps as ForestsTooltipTriggerProps & {
          color?: string
          type?: string
        }
        void ignoredColor
        void ignoredType

        return children(resolvedTriggerProps)
      }}
    />
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner
        side={side}
        sideOffset={8}
        style={{ zIndex: 1500, pointerEvents: 'none' }}
      >
        <BaseTooltip.Popup
          style={{ position: 'relative', pointerEvents: 'none' }}
          render={(popupProps) => (
            <Box
              {...popupProps}
              role="tooltip"
              sx={{
                maxWidth: 260,
                px: 1,
                py: 0.75,
                borderRadius: '5px',
                backgroundColor: '#111111',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 400,
                lineHeight: 1.35,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
              }}
            >
              {title}
              <BaseTooltip.Arrow
                render={(arrowProps) => (
                  <Box
                    {...arrowProps}
                    sx={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      backgroundColor: '#111111',
                      transform: 'rotate(45deg)',
                      ...getForestsTooltipArrowSx(side),
                    }}
                  />
                )}
              />
            </Box>
          )}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  </BaseTooltip.Root>
)

const ForestsInfoTooltip = ({
  title,
  ariaLabel,
  sx,
  iconSx,
}: {
  title: React.ReactNode
  ariaLabel: string
  sx?: AppSxProps
  iconSx?: AppSxProps
}) => (
  <ForestsTooltip title={title}>
    {(triggerProps) => (
      <IconButton
        {...triggerProps}
        type="button"
        size="small"
        aria-label={ariaLabel}
        sx={[infoTooltipButtonSx, ...toSxArray(sx)]}
      >
        <Info sx={[{ width: 16, height: 16 }, ...toSxArray(iconSx)]} />
      </IconButton>
    )}
  </ForestsTooltip>
)

const ForestsBarChartIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    style={{ display: 'block', fill: 'currentColor' }}
  >
    <rect x="5" y="10" width="3.5" height="9" rx="0.8" />
    <rect x="10.25" y="5" width="3.5" height="14" rx="0.8" />
    <rect x="15.5" y="13" width="3.5" height="6" rx="0.8" />
  </svg>
)

const ForestsGraphPanelProvider = ({
  hasGraphPanel,
  renderGraphPanelContent,
  children,
}: {
  hasGraphPanel: boolean
  renderGraphPanelContent: (params: {
    closeGraphPanel: () => void
  }) => React.ReactNode
  children: React.ReactNode
}) => {
  const [isGraphPanelOpen, setIsGraphPanelOpen] = useState(false)
  const closeGraphPanel = () => setIsGraphPanelOpen(false)

  const graphActionButton =
    hasGraphPanel ? (
      <ForestsTooltip title={isGraphPanelOpen ? 'Hide graphs' : 'Show graphs'}>
        {(triggerProps) => (
          <IconButton
            {...triggerProps}
            type="button"
            aria-label={isGraphPanelOpen ? 'hide graphs' : 'show graphs'}
            onClick={() => setIsGraphPanelOpen((open) => !open)}
            sx={[
              graphActionButtonSx,
              isGraphPanelOpen && {
                color: '#ffffff',
                backgroundColor: '#0D6044',
                '&:hover': {
                  backgroundColor: '#094832',
                },
              },
            ]}
          >
            <ForestsBarChartIcon />
          </IconButton>
        )}
      </ForestsTooltip>
    ) : null

  const sidebarPanelExtensionRuntimeOptions =
    useMemo<SidebarPanelExtensionRuntimeOptions>(
      () => ({
        panelLayout: 'single',
        visiblePanels: hasGraphPanel && isGraphPanelOpen ? ['main'] : [],
        activePanel: 'main',
        mobileMode: 'stacked',
        mobileStackPlacement: 'before',
        actionRailPlacement: 'bottomActionRow',
      }),
      [hasGraphPanel, isGraphPanelOpen]
    )

  return (
    <SidebarPanelExtensionProvider
      id="forests-graph-panel-extension"
      enabled={hasGraphPanel}
      runtimeOptions={sidebarPanelExtensionRuntimeOptions}
    >
      {children}
      {hasGraphPanel && (
        <IntoSidebarPanelExtensionPanelSlot panelId="main">
          {renderGraphPanelContent({ closeGraphPanel })}
        </IntoSidebarPanelExtensionPanelSlot>
      )}
      {graphActionButton && (
        <IntoSidebarPanelExtensionActionRailSlot>
          {graphActionButton}
        </IntoSidebarPanelExtensionActionRailSlot>
      )}
    </SidebarPanelExtensionProvider>
  )
}

// for (const sourceName of Object.keys(layerOptions)) {
//   const layerName = `${sourceName}-fill`
//   // eslint-disable-next-line no-loop-func
//   genericPopupHandler(layerName, (ev) => {
//     const feature = ev.features[0]

//     // Only copy over currently selected features:
//     const idName = layerOptions[sourceName].id
//     const id = feature.properties[idName]

//     // A bit of a hack: Ensure feature.id refers to some meaningful identifier for highlighting etc.
//     feature.id = id

//     assert(id !== null && id !== undefined, `Feature has no id: ${JSON.stringify(feature.properties)}`)

//     const bounds = querySourceFeatures(sourceName, 'default')
//       .filter((f) => f.properties[idName] === id)
//       .map((f) => f.bbox || getGeoJsonGeometryBounds((f.geometry as any).coordinates))
//       .reduce(
//         ([a1, b1, c1, d1], [a2, b2, c2, d2]) => [
//           Math.min(a1, a2),
//           Math.min(b1, b2),
//           Math.max(c1, c2),
//           Math.max(d1, d2),
//         ],
//         [999, 999, -999, -999] // fallback bounds
//       )

//     const prevSelectedFeatures = SelectedFeatureState.selectedFeatures.get()
//     SelectedFeatureState.selectFeature({ layer: layerName, feature, bounds })

//     const oldIds = prevSelectedFeatures.map((x) => x.feature.id)
//     const newIds = oldIds.includes(id) ? oldIds.filter((x) => x !== id) : oldIds.concat(id)

//     const newFilter = ['in', idName, ...newIds]
//     setFilter(`${sourceName}-highlighted`, newFilter)
//     console.debug(`${sourceName}-highlighted`, newFilter)

//     // Open the report panel immediately when a feature was selected and nothing was selected prior to it.
//     if (feature && prevSelectedFeatures.length === 0) setIsSidebarOpen(true)

//     if (newIds.includes(id)) Analytics.setParams({ highlightedFeatureId: id })
//   })
// }

const FinlandForests = () => {
  const enableLayerGroup = useMapStore((state) => state.enableLayerGroup)
  const removeSelectedFeatures = useMapStore(
    (state) => state.removeSelectedFeatures
  )

  useLayerGroup('fi_forests', layerConf)
  const updateMapDetails = useUpdateMapDetails()
  const filteredFeatures = useSelectedFeaturesFilteredByLayer(
    Object.keys(layerOptions).map((x) => `${x}-fill`)
  )
  const hasFeature = filteredFeatures.length > 0
  const { formatNumber } = useLocaleFormatter()

  useEffect(() => {
    enableLayerGroup('fi_forests', { layerConf })
  }, [enableLayerGroup])

  const [forestryMethod, setForestryMethod] = useState<ForestryMethod>(
    DEFAULT_FORESTRY_METHOD
  )
  const [perHectareFlag, setPerHectareFlag] = useState(true)
  const [cumulativeFlag, setCumulativeFlag] = useState(true)
  const [carbonBalanceDifferenceFlag, setCarbonBalanceDifferenceFlag] =
    useState(true)
  const effectiveCarbonBalanceDifferenceFlag =
    forestryMethod === TRADITIONAL_FORESTRY_METHOD
      ? false
      : carbonBalanceDifferenceFlag

  // Analytics.setParams({
  //   forestryMethod,
  //   perHectareFlag,
  //   cumulativeFlag,
  //   carbonBalanceDifferenceFlag,
  // })

  // i.e. which projection/method is in use:
  // NB: an unknown methodName is also valid; dataset==-1 -> compare against the best option

  // TODO: enable selected features
  // const { layer, feature, bounds } = useObservable(SelectedFeatureState.selectedFeatures)
  // const hasFeature = selectedFeatures.length > 0

  // TODO: Why does commenting this out make the fill colors work?
  useEffect(() => {
    updateMapDetails(forestryMethod, effectiveCarbonBalanceDifferenceFlag)
  }, [
    forestryMethod,
    effectiveCarbonBalanceDifferenceFlag,
    updateMapDetails,
  ])

  // TODO: enable overlay message and search placeholder
  // useEffect(() => {
  //   setOverlayMessage(!hasFeature, {
  //     layerGroupId: 'fi_forests',
  //     message: 'Zoom in and click a forest area for carbon report',
  //   })
  //   // setSearchPlaceholder({
  //   //   layer: LAYER_ID,
  //   //   placeholder: 'Look up by property ID',
  //   // })
  // }, [hasFeature])

  const options = useMemo<ForestsOptions>(() => {
    const allFeatureProps = filteredFeatures.map((x) => x.properties)

    const totals = getTotals(
      forestryMethod,
      perHectareFlag,
      allFeatureProps
    ) as ForestsTotals

    const attrValues = getDatasetAttributes(
      forestryMethod,
      cumulativeFlag,
      totals
    )

    if (effectiveCarbonBalanceDifferenceFlag) {
      const traditional = getDatasetAttributes(
        TRADITIONAL_FORESTRY_METHOD,
        cumulativeFlag,
        totals
      )
      for (const attr in attrValues) {
        attrValues[attr] = attrValues[attr].map(
          (v: number, i: number) => v - traditional[attr][i]
        )
      }
    }

    const npvText = getNpvText(
      effectiveCarbonBalanceDifferenceFlag,
      perHectareFlag,
      totals,
      formatNumber,
      forestryMethod
    )

    const cbt = getChartProps(
      'cbt',
      cumulativeFlag,
      perHectareFlag,
      attrValues
    ) as ForestsChartConfig
    const bio = getChartProps(
      'bio',
      cumulativeFlag,
      perHectareFlag,
      attrValues
    ) as ForestsChartConfig
    const wood = getChartProps(
      'harvested-wood',
      cumulativeFlag,
      perHectareFlag,
      attrValues
    ) as ForestsChartConfig

    const getAverageCarbonBalanceFigure = (figureTotals: ForestsTotals) => {
      const averageCarbonBalanceDecade =
        figureTotals[`f${forestryMethod}_cbt1_area_mult_sum`] -
        (effectiveCarbonBalanceDifferenceFlag
          ? figureTotals[`f${TRADITIONAL_FORESTRY_METHOD}_cbt1_area_mult_sum`]
          : 0)
      // per decade -> per year
      return averageCarbonBalanceDecade / 10
    }

    const averageCarbonBalance = getAverageCarbonBalanceFigure(totals)
    const unit = perHectareFlag ? 'tons CO₂e/ha/y' : 'tons CO₂e/y'
    const averageCarbonBalanceText = isNaN(averageCarbonBalance)
      ? ''
      : `${averageCarbonBalance > 0 ? '+' : ''}${formatNumber(
          averageCarbonBalance,
          {
            maximumFractionDigits: 2,
          }
        )} ${unit}`

    const totalsOverall = getTotals(forestryMethod, false, allFeatureProps)
    const averageCarbonBalanceOverall = getAverageCarbonBalanceFigure(
      totalsOverall as ForestsTotals
    )

    return {
      totals,
      npvText,
      averageCarbonBalanceText,
      averageCarbonBalanceOverall,
      cbt,
      bio,
      wood,
    }
  }, [
    filteredFeatures,
    forestryMethod,
    effectiveCarbonBalanceDifferenceFlag,
    perHectareFlag,
    cumulativeFlag,
    formatNumber,
  ])

  const onChangeCheckbox = (
    callback: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return (
      _event: React.ChangeEvent<HTMLInputElement>,
      checked: boolean
    ) => {
      callback(checked)
    }
  }

  const normalizeNamefin = (value?: string) => {
    if (!value) return value
    if (value === value.toUpperCase()) {
      const lower = value.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    }
    return value
  }

  const getAreaNameParts = (feature: MapGeoJSONFeature): AreaNameParts => {
    const props = feature.properties ?? {}
    const nameFin = normalizeNamefin(props.namefin)
    if (nameFin) {
      return {
        label: nameFin,
        display: nameFin,
      }
    }

    if (props.estate_id_text) {
      const label = `Property with forest (${props.estate_id_text})`
      return {
        label,
        display: (
          <>
            Property with forest{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 600,
                display: 'inline-block',
                whiteSpace: 'nowrap',
              }}
            >
              ({props.estate_id_text})
            </Box>
          </>
        ),
      }
    }

    if (props.standid) {
      const label = `Forest parcel (${props.standid})`
      return {
        label,
        display: (
          <>
            Forest parcel{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 600,
                display: 'inline-block',
                whiteSpace: 'nowrap',
              }}
            >
              ({props.standid})
            </Box>
          </>
        ),
      }
    }

    return {
      label: 'Unnamed area',
      display: 'Unnamed area',
    }
  }

  const getFeatureArea = (feature: MapGeoJSONFeature) => {
    const props = feature.properties ?? {}
    const areaValue =
      props.area ?? props.f_area ?? props.area_ha ?? props.area_hectares
    if (typeof areaValue === 'number') {
      return `${formatNumber(areaValue, {
        maximumFractionDigits: 1,
      })} ha`
    }
    return ''
  }

  const handleDeselectFeature = (feature: MapGeoJSONFeature) => {
    removeSelectedFeatures({ features: [feature] })
  }

  const selectedAreaRows = filteredFeatures.map((feature) => {
    const props = feature.properties ?? {}
    const featureId = feature.id ?? props.id

    const nameParts = getAreaNameParts(feature)

    return {
      id: String(featureId),
      label: nameParts.label,
      display: nameParts.display,
      area: getFeatureArea(feature),
      feature: feature,
    }
  })

  const summaryRows = options
    ? [
        {
          key: 'forest-area',
          name: 'Forest area',
          value: hasFeature
            ? `${formatNumber(options.totals.f_area ?? 0, {
                maximumFractionDigits: 1,
              })} ha`
            : '',
        },
        {
          key: 'average-carbon-balance',
          name: (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                columnGap: 0.5,
                rowGap: 0,
              }}
            >
              <Box
                component="span"
                sx={{
                  typography: 'body2',
                  fontWeight: 'inherit',
                  lineHeight: 1.4,
                }}
              >
                Average carbon balance
                <ForestsInfoTooltip
                  ariaLabel="Show average carbon balance information"
                  title={
                    <Box>
                      <Box
                        component="ul"
                        sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}
                      >
                        <li>Assuming even-age forestry</li>
                        <li>
                          Carbon balance means changes in soil, trees, and wood
                          products. When the carbon balance is positive, more
                          carbon is being stored than released.
                        </li>
                      </Box>
                    </Box>
                  }
                  sx={{ ml: 0.5, mb: '-2px' }}
                />
              </Box>
            </Box>
          ),
          value: hasFeature ? options.averageCarbonBalanceText : '',
        },
        {
          key: 'npv',
          name: 'Net present value (3% discounting)',
          value: hasFeature ? options.npvText : '',
        },
      ]
    : []

  const renderGraphPanelContent = ({
    closeGraphPanel,
  }: {
    closeGraphPanel: () => void
  }) =>
    options != null ? (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: SIDEBAR_PADDING_REM + 'rem',
          backgroundColor: '#ffffff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            mb: 7,
          }}
        >
          <SwitchWithLabel
            sx={{ flex: 1, minWidth: 0 }}
            controlSx={{ flexShrink: 0 }}
            checked={cumulativeFlag}
            onChange={onChangeCheckbox(setCumulativeFlag)}
          >
            Show cumulative carbon balance
          </SwitchWithLabel>
          <IconButton
            aria-label="close graphs panel"
            onClick={closeGraphPanel}
            size="small"
            sx={graphActionButtonSx}
          >
            <Cross sx={{ width: '1rem', height: '1rem' }} />
          </IconButton>
        </Box>
        {hasFeature && (
          <>
            <Box
              sx={{
                mt: 1,
                backgroundColor: 'neutral.light',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  typography: 'body2',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  columnGap: 0.5,
                  rowGap: 0.5,
                }}
              >
                <Box component="span">
                  <abbr title="Carbon dioxide equivalent">
                    CO<sub>2</sub>eq
                  </abbr>
                </Box>
                <Box component="span">
                  carbon balance (
                  {getUnitPerArea('cbt', cumulativeFlag, perHectareFlag)})
                </Box>
              </Box>
              <Box sx={graphChartBoxSx}>
                <FinlandForestsChart
                  options={options.cbt.chartOptions.options}
                  data={options.cbt.chartOptions.data}
                />
              </Box>
            </Box>
            <Box
              sx={{
                mt: 5,
                backgroundColor: 'neutral.light',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  typography: 'body2',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  columnGap: 0.5,
                  rowGap: 0.5,
                  flexWrap: 'wrap',
                }}
              >
                Forest carbon stock (tons C/ha)
                <ForestsInfoTooltip
                  ariaLabel="Show forest carbon stock note"
                  title={
                    <Box>
                      multiply by 3.67 to get CO<sub>2</sub>eq amounts
                    </Box>
                  }
                  sx={{ ml: 0.5, mb: 0.2 }}
                />
              </Box>
              <Box sx={graphChartBoxSx}>
                <FinlandForestsChart
                  options={options.bio.chartOptions.options}
                  data={options.bio.chartOptions.data}
                />
              </Box>
            </Box>
            <Box
              sx={{
                mt: 5,
                backgroundColor: 'neutral.light',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  typography: 'body2',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  columnGap: 0.5,
                  rowGap: 0.5,
                }}
              >
                <Box component="span">
                  Harvested wood (
                  {getUnitPerArea(
                    'harvested-wood',
                    cumulativeFlag,
                    perHectareFlag
                  )}
                  )
                </Box>
              </Box>
              <Box sx={graphChartBoxSx}>
                <FinlandForestsChart
                  options={options.wood.chartOptions.options}
                  data={options.wood.chartOptions.data}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    ) : null

  const hasGraphPanel = hasFeature && options != null

  return (
    <ForestsGraphPanelProvider
      key={hasGraphPanel ? 'forests-graph-selected' : 'forests-graph-empty'}
      hasGraphPanel={hasGraphPanel}
      renderGraphPanelContent={renderGraphPanelContent}
    >
      <IntoSidebarPanelSlot panelId="main">
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
            imageSrc="/files/img/green-drawings/forest.jpg"
            imageAlt="Forest"
            title="Forest carbon report"
            description="Select a forest area to compare carbon balance, carbon stock, harvested wood, and forestry methods."
            imageSx={{
              height: '5.625rem',
              objectPosition: 'center 45%',
            }}
            contentSx={{
              px: '2.4375rem',
              pt: '3rem',
              pb: '3.5rem',
              gap: '2rem',
            }}
            headerSx={{
              gap: '1.5rem',
            }}
            descriptionSx={{
              width: '100%',
              maxWidth: 'none',
            }}
          />

          {options != null && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* TODO: enable headerTable */}
              <Box>
                {hasFeature ? (
                  <Box>
                    <Box>
                      <Box
                        sx={{
                          backgroundColor: 'neutral.lighter',
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          component="table"
                          sx={{
                            width: '100%',
                            borderCollapse: 'collapse',
                          }}
                        >
                          <Box component="tbody">
                            {selectedAreaRows.map((row) => (
                              <Box component="tr" key={row.id}>
                                <Box
                                  component="td"
                                  sx={{
                                    py: 1,
                                    pl: 2,
                                    pr: 1.5,
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {row.display}
                                </Box>
                                <Box
                                  component="td"
                                  sx={{
                                    py: 1,
                                    px: 0,
                                    textAlign: 'right',
                                    whiteSpace: 'nowrap',
                                    minWidth: 80,
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {row.area}
                                </Box>
                                <Box
                                  component="td"
                                  sx={{
                                    py: 1,
                                    pr: 2,
                                    textAlign: 'right',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    aria-label={`Remove ${row.label}`}
                                    onClick={() =>
                                      handleDeselectFeature(row.feature)
                                    }
                                  >
                                    <Cross sx={{ width: 14, height: 14 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                        <Box
                          component="table"
                          sx={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            mt: 3,
                          }}
                        >
                          <Box
                            component="tbody"
                            sx={{
                              'td:first-of-type': { pl: 2, pr: 1.5 },
                              'td:last-of-type': { pr: 2 },
                            }}
                          >
                            {summaryRows.map((row) => (
                              <Box component="tr" key={row.key}>
                                <Box
                                  component="td"
                                  sx={{
                                    py: 1,
                                    px: 0,
                                    fontWeight: 500,
                                    verticalAlign: 'top',
                                  }}
                                >
                                  {row.name}
                                </Box>
                                <Box
                                  component="td"
                                  sx={{
                                    py: 1,
                                    px: 0,
                                    textAlign: 'right',
                                    whiteSpace: 'nowrap',
                                    minWidth: 80,
                                  }}
                                >
                                  {row.value}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Box
                        component="span"
                        sx={{
                          typography: 'body2',
                          fontStyle: 'italic',
                          display: 'inline',
                        }}
                      >
                        Equals{' '}
                        {formatNumber(
                          options.averageCarbonBalanceOverall /
                            CO2_TONS_PER_PERSON,
                          {
                            maximumFractionDigits: 0,
                          }
                        )}{' '}
                        times average 👤 CO₂ emissions
                        <ForestsInfoTooltip
                          ariaLabel="Show emissions equivalent note"
                          title="10.7 tonnes of CO₂ equivalents per capita. EU-27, 2022."
                          sx={{ ml: 1, mb: '-3px' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 3,
                      mb: 6,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Star
                      sx={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ typography: 'body2', ml: 1.5 }}>
                      Select a forest area to explore its carbon report. You can
                      zoom in and out to view different levels.
                    </Box>
                  </Box>
                )}
                <SwitchWithLabel
                  sx={{ mt: 7 }}
                  controlSx={{ flexShrink: 0 }}
                  checked={perHectareFlag}
                  onChange={onChangeCheckbox(setPerHectareFlag)}
                >
                  Show values per hectare
                </SwitchWithLabel>
                <SwitchWithLabel
                  sx={{ mt: 2 }}
                  controlSx={{ flexShrink: 0 }}
                  checked={effectiveCarbonBalanceDifferenceFlag}
                  onChange={onChangeCheckbox(setCarbonBalanceDifferenceFlag)}
                  disabled={forestryMethod === TRADITIONAL_FORESTRY_METHOD}
                >
                  Show carbon balance improvement potential compared to the
                  prevalent forestry practice
                </SwitchWithLabel>
                <Box
                  sx={{
                    mt: 7,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'neutral.lighter',
                  }}
                >
                  <Box>
                    <DropDownSelectWithHeader
                      label={'Choose forestry method for calculations:'}
                      value={forestryMethod.toString()}
                      options={[
                        {
                          value: ForestryMethod.eihakata + '',
                          label: 'No cuttings',
                        },
                        {
                          value: ForestryMethod.jatkuva + '',
                          label: 'Continuous cover forestry',
                        },
                        {
                          value: ForestryMethod.tasaikainen + '',
                          label: 'Thin from below - extended rotation',
                        },
                        {
                          value: ForestryMethod.vapaa + '',
                          label: 'Unrestricted',
                        },
                      ]}
                      onChange={(event) => {
                        const nextForestryMethod = Number(
                          event.target.value
                        ) as ForestryMethod
                        setForestryMethod(nextForestryMethod)
                        if (
                          nextForestryMethod === TRADITIONAL_FORESTRY_METHOD
                        ) {
                          setCarbonBalanceDifferenceFlag(false)
                        }
                      }}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { mobile: 'column', desktop: 'row' },
                        alignItems: 'center',
                        justifyContent: 'start',
                        gap: 1,
                        flexWrap: 'wrap',
                        textAlign: { mobile: 'center', desktop: 'left' },
                      }}
                    >
                      <Box
                        sx={{ typography: 'body2', fontSize: '0.675rem' }}
                      >
                        Scientific forest model by
                      </Box>
                      <Link
                        href="https://arvometsa.fi"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'inline-flex', alignItems: 'center' }}
                      >
                        <FrameworkImage
                          alt="Arvometsä"
                          src={arvometsaLogo}
                          width={595}
                          height={153}
                          style={{ width: 100, height: 'auto' }}
                        />
                      </Link>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </SidebarContentBox>
      </IntoSidebarPanelSlot>
    </ForestsGraphPanelProvider>
  )
}

export default FinlandForests
