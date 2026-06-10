'use client'

import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import Image from 'next/image'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { css, cx } from 'styled-system/css'

import { getCombinedBounds } from '#/common/utils/map'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { Box } from '#/components/common/PandaBox'
import Link from '#/components/common/Link'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
import SimpleTooltip from '#/components/common/SimpleTooltip'
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
import {
  getTotals,
  getDatasetAttributes,
  getChartTitle,
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
  titleRenames,
} from './constants'

import arvometsaLogo from './public/arvometsa_logo.png'
// import * as Analytics from 'src/map/analytics'

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

type TypographyProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'color'
> & {
  component?: React.ElementType
  variant?: string
  typography?: string
  styleProps?: PandaStyleProp
}

const Typography = ({
  component = 'p',
  variant,
  typography,
  styleProps,
  children,
  ...props
}: TypographyProps) => (
  <Box
    component={component}
    styleProps={[
      { m: 0, textStyle: typography ?? variant ?? 'body2' },
      ...pandaStylePropsToArray(styleProps),
    ]}
    {...props}
  >
    {children}
  </Box>
)

type TooltipProps = {
  title?: React.ReactNode
  arrow?: boolean
  children: React.ReactElement
}

const Tooltip = ({ title, children }: TooltipProps) => (
  <SimpleTooltip title={title}>{children}</SimpleTooltip>
)

type IconButtonProps = Omit<
  React.ComponentProps<typeof BaseButton>,
  'className' | 'style' | 'color'
> & {
  styleProps?: PandaStyleProp
  size?: 'small' | 'medium'
}

const iconButtonBaseStyle = {
  m: 0,
  p: 0,
  border: 0,
  width: '2rem',
  minWidth: '2rem',
  height: '2rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  color: 'inherit',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-main)',
    outlineOffset: '2px',
  },
} as const

const IconButton = ({
  styleProps,
  children,
  type = 'button',
  size,
  ...props
}: IconButtonProps) => (
  <BaseButton
    {...props}
    type={type}
    className={cx(
      css(
        iconButtonBaseStyle,
        size === 'small' && {
          width: '1.75rem',
          minWidth: '1.75rem',
          height: '1.75rem',
        },
        ...pandaStylePropsToArray(styleProps)
      )
    )}
    style={mergePandaStyleProps({ styleProps })}
  >
    {children}
  </BaseButton>
)

const BarChartIcon = () => (
  <svg
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M5 20V10M12 20V4M19 20v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 20h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

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
  const [hasFeature, setHasFeature] = useState(false)
  const [options, setOptions] = useState<any>(null)
  const filteredFeatures = useSelectedFeaturesFilteredByLayer(
    Object.keys(layerOptions).map((x) => `${x}-fill`)
  )
  const { formatNumber } = useLocaleFormatter()

  useEffect(() => {
    enableLayerGroup('fi_forests', { layerConf })
  }, [])

  useLayoutEffect(() => {
    const newHasFeature = filteredFeatures.length > 0
    setHasFeature(newHasFeature)
  }, [filteredFeatures])

  const [reportPanelOpen, setReportPanelOpen] = useState(true)
  const [isGraphPanelOpen, setIsGraphPanelOpen] = useState(false)

  useEffect(() => {
    if (!hasFeature) {
      setIsGraphPanelOpen(false)
    }
  }, [hasFeature])

  const [forestryMethod, setForestryMethod] = useState<ForestryMethod>(
    DEFAULT_FORESTRY_METHOD
  )
  const [perHectareFlag, setPerHectareFlag] = useState(true)
  const [cumulativeFlag, setCumulativeFlag] = useState(true)
  const [carbonBalanceDifferenceFlag, setCarbonBalanceDifferenceFlag] =
    useState(true)

  // Analytics.setParams({
  //   reportPanelOpen,
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
    // Eliminate confusing options (all zeroes)
    if (
      forestryMethod === TRADITIONAL_FORESTRY_METHOD &&
      carbonBalanceDifferenceFlag
    ) {
      setCarbonBalanceDifferenceFlag(false)
    }
    updateMapDetails(forestryMethod, carbonBalanceDifferenceFlag)
  }, [forestryMethod, carbonBalanceDifferenceFlag])

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

  useEffect(() => {
    const newOptions: any = {}
    const allFeatureProps = filteredFeatures.map((x) => x.properties)

    newOptions.totals = getTotals(
      forestryMethod,
      perHectareFlag,
      allFeatureProps
    )

    const attrValues = getDatasetAttributes(
      forestryMethod,
      cumulativeFlag,
      newOptions.totals
    )

    if (carbonBalanceDifferenceFlag) {
      const traditional = getDatasetAttributes(
        TRADITIONAL_FORESTRY_METHOD,
        cumulativeFlag,
        newOptions.totals
      )
      for (const attr in attrValues) {
        attrValues[attr] = attrValues[attr].map(
          (v: number, i: number) => v - traditional[attr][i]
        )
      }
    }

    const selectedLayersOfFeatures = filteredFeatures.map((x) => x.layer)

    const title = getChartTitle(selectedLayersOfFeatures, allFeatureProps)
    newOptions.npvText = getNpvText(
      carbonBalanceDifferenceFlag,
      perHectareFlag,
      newOptions.totals,
      formatNumber,
      forestryMethod
    )

    newOptions.cbt = getChartProps(
      'cbt',
      cumulativeFlag,
      perHectareFlag,
      attrValues
    )
    newOptions.bio = getChartProps(
      'bio',
      cumulativeFlag,
      perHectareFlag,
      attrValues
    )
    newOptions.wood = getChartProps(
      'harvested-wood',
      cumulativeFlag,
      perHectareFlag,
      attrValues
    )

    const getAverageCarbonBalanceFigure = (totals: any) => {
      const averageCarbonBalanceDecade =
        totals[`f${forestryMethod}_cbt1_area_mult_sum`] -
        (carbonBalanceDifferenceFlag
          ? totals[`f${TRADITIONAL_FORESTRY_METHOD}_cbt1_area_mult_sum`]
          : 0)
      // per decade -> per year
      return averageCarbonBalanceDecade / 10
    }

    const averageCarbonBalance = getAverageCarbonBalanceFigure(
      newOptions.totals
    )
    const unit = perHectareFlag ? 'tons CO₂e/ha/y' : 'tons CO₂e/y'
    newOptions.averageCarbonBalanceText = isNaN(averageCarbonBalance)
      ? ''
      : `${averageCarbonBalance > 0 ? '+' : ''}${formatNumber(
          averageCarbonBalance,
          {
            maximumFractionDigits: 2,
          }
        )} ${unit}`

    const totalsOverall = getTotals(forestryMethod, false, allFeatureProps)
    newOptions.averageCarbonBalanceOverall =
      getAverageCarbonBalanceFigure(totalsOverall)

    newOptions.headerTitle = titleRenames[title] || title

    newOptions.bounds = getCombinedBounds(filteredFeatures)
    newOptions.showReport = reportPanelOpen && hasFeature

    setOptions(newOptions)
  }, [
    filteredFeatures,
    reportPanelOpen,
    hasFeature,
    forestryMethod,
    carbonBalanceDifferenceFlag,
    perHectareFlag,
    cumulativeFlag,
    formatNumber,
  ])

  const onChangeCheckbox = (
    callback: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return (event: any) => {
      callback((event.target as HTMLInputElement).checked)
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

  const getAreaNameParts = (feature: any) => {
    const props = feature?.properties ?? {}
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
              styleProps={{
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
              styleProps={{
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

  const getFeatureArea = (feature: any) => {
    const props = feature?.properties ?? {}
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

  const selectedAreaRows = filteredFeatures.map(
    (feature: any, index: number) => {
      const props = feature?.properties ?? {}
      const featureId = feature?.id ?? props.id

      const nameParts = getAreaNameParts(feature)

      return {
        id: String(featureId),
        label: nameParts.label,
        display: nameParts.display,
        area: getFeatureArea(feature),
        feature: feature,
      }
    }
  )

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
              styleProps={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                columnGap: 0.5,
                rowGap: 0,
              }}
            >
              <Typography
                component="span"
                variant="body2"
                styleProps={{ fontWeight: 'inherit', lineHeight: 1.4 }}
              >
                Average carbon balance
                <Tooltip
                  arrow
                  title={
                    <Box>
                      <Box
                        component="ul"
                        styleProps={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}
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
                >
                  <Info
                    styleProps={{
                      color: 'action.active',
                      width: 16,
                      height: 16,
                      ml: 0.5,
                      mb: '-2px',
                    }}
                  />
                </Tooltip>
              </Typography>
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

  const graphPanelContent =
    options != null ? (
      <Box
        styleProps={{
          display: 'flex',
          flexDirection: 'column',
          p: SIDEBAR_PADDING_REM + 'rem',
          backgroundColor: '#ffffff',
        }}
      >
        <Box
          styleProps={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            mb: 7,
          }}
        >
          <SwitchWithLabel
            styleProps={{ flex: 1, minWidth: 0 }}
            checked={cumulativeFlag}
            onChange={onChangeCheckbox(setCumulativeFlag)}
          >
            Show cumulative carbon balance
          </SwitchWithLabel>
          <IconButton
            aria-label="close graphs panel"
            onClick={() => setIsGraphPanelOpen(false)}
            size="small"
            styleProps={graphActionButtonSx}
          >
            <Cross styleProps={{ width: '1rem', height: '1rem' }} />
          </IconButton>
        </Box>
        {hasFeature && (
          <>
            <Box
              styleProps={{
                mt: 1,
                backgroundColor: 'neutral.light',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                styleProps={{
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
              </Typography>
              <Box styleProps={graphChartBoxSx}>
                <FinlandForestsChart
                  options={options.cbt.chartOptions.options}
                  data={options.cbt.chartOptions.data}
                />
              </Box>
            </Box>
            <Box
              styleProps={{
                mt: 5,
                backgroundColor: 'neutral.light',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                styleProps={{
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  columnGap: 0.5,
                  rowGap: 0.5,
                  flexWrap: 'wrap',
                }}
              >
                Forest carbon stock (tons C/ha)
                <Tooltip
                  arrow
                  title={
                    <Box>
                      multiply by 3.67 to get CO<sub>2</sub>eq amounts
                    </Box>
                  }
                >
                  <Info
                    styleProps={{
                      color: 'action.active',
                      width: 16,
                      height: 16,
                      ml: 0.5,
                      mb: 0.2,
                    }}
                  />
                </Tooltip>
              </Typography>
              <Box styleProps={graphChartBoxSx}>
                <FinlandForestsChart
                  options={options.bio.chartOptions.options}
                  data={options.bio.chartOptions.data}
                />
              </Box>
            </Box>
            <Box
              styleProps={{
                mt: 5,
                backgroundColor: 'neutral.light',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                styleProps={{
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
              </Typography>
              <Box styleProps={graphChartBoxSx}>
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

  const hasGraphPanel = hasFeature && graphPanelContent != null

  const graphActionButton =
    hasGraphPanel ? (
      <Tooltip title={isGraphPanelOpen ? 'Hide graphs' : 'Show graphs'} arrow>
        <IconButton
          aria-label={isGraphPanelOpen ? 'hide graphs' : 'show graphs'}
          onClick={() => setIsGraphPanelOpen((open) => !open)}
          styleProps={[
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
          <BarChartIcon />
        </IconButton>
      </Tooltip>
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
      <IntoSidebarPanelSlot panelId="main">
        <SidebarContentBox
          scrollFadeColor="#ffffff"
          innerStyleProps={{
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
              styleProps={{
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
                        styleProps={{
                          backgroundColor: 'neutral.lighter',
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          component="table"
                          styleProps={{
                            width: '100%',
                            borderCollapse: 'collapse',
                          }}
                        >
                          <Box component="tbody">
                            {selectedAreaRows.map((row) => (
                              <Box component="tr" key={row.id}>
                                <Box
                                  component="td"
                                  styleProps={{
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
                                  styleProps={{
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
                                  styleProps={{
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
                                    <Cross styleProps={{ width: 14, height: 14 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                        <Box
                          component="table"
                          styleProps={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            mt: 3,
                          }}
                        >
                          <Box
                            component="tbody"
                            styleProps={{
                              '& td:first-of-type': { pl: 2, pr: 1.5 },
                              '& td:last-of-type': { pr: 2 },
                            }}
                          >
                            {summaryRows.map((row) => (
                              <Box component="tr" key={row.key}>
                                <Box
                                  component="td"
                                  styleProps={{
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
                                  styleProps={{
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
                    <Box styleProps={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        component="span"
                        styleProps={{
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
                        <Tooltip
                          arrow
                          title="10.7 tonnes of CO₂ equivalents per capita. EU-27, 2022."
                        >
                          <Info
                            styleProps={{
                              color: 'action.active',
                              width: 16,
                              height: 16,
                              ml: 1,
                              mb: '-3px',
                            }}
                          />
                        </Tooltip>
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    styleProps={{
                      mt: 3,
                      mb: 6,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Star
                      styleProps={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" styleProps={{ ml: 1.5 }}>
                      Select a forest area to explore its carbon report. You can
                      zoom in and out to view different levels.
                    </Typography>
                  </Box>
                )}
                <SwitchWithLabel
                  styleProps={{ mt: 7 }}
                  checked={perHectareFlag}
                  onChange={(event) => {
                    onChangeCheckbox(setPerHectareFlag)(event)
                    setReportPanelOpen(true)
                  }}
                >
                  Show values per hectare
                </SwitchWithLabel>
                <SwitchWithLabel
                  styleProps={{ mt: 2 }}
                  checked={carbonBalanceDifferenceFlag}
                  onChange={onChangeCheckbox(setCarbonBalanceDifferenceFlag)}
                  disabled={forestryMethod === TRADITIONAL_FORESTRY_METHOD}
                >
                  Show carbon balance improvement potential compared to the
                  prevalent forestry practice
                </SwitchWithLabel>
                <Box
                  styleProps={{
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
                        setForestryMethod(Number(event.target.value))
                      }}
                      styleProps={{ width: '100%' }}
                    />
                  </Box>
                  <Box styleProps={{ mt: 2 }}>
                    <Box
                      styleProps={{
                        display: 'flex',
                        flexDirection: { mobile: 'column', desktop: 'row' },
                        alignItems: 'center',
                        justifyContent: 'start',
                        gap: 1,
                        flexWrap: 'wrap',
                        textAlign: { mobile: 'center', desktop: 'left' },
                      }}
                    >
                      <Typography
                        typography="body2"
                        styleProps={{ fontSize: '0.675rem' }}
                      >
                        Scientific forest model by
                      </Typography>
                      <Link
                        href="https://arvometsa.fi"
                        target="_blank"
                        rel="noopener noreferrer"
                        styleProps={{ display: 'inline-flex', alignItems: 'center' }}
                      >
                        <Image
                          alt="Arvometsä"
                          src={arvometsaLogo}
                          width={arvometsaLogo.width}
                          height={arvometsaLogo.height}
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
      {hasGraphPanel && (
        <IntoSidebarPanelExtensionPanelSlot panelId="main">
          {graphPanelContent}
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

export default FinlandForests
