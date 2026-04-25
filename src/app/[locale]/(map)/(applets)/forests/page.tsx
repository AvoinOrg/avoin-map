'use client'

import React, { useState, useEffect, useLayoutEffect } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
import Image from 'next/image'
import { MapGeoJSONFeature } from 'maplibre-gl'

import { getCombinedBounds } from '#/common/utils/map'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import Link from '#/components/common/Link'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
// import { setOverlayMessage } from '../../OverlayMessages/OverlayMessages'
// import * as SelectedFeatureState from './ArvometsaSelectedLayer'
import { useMapStore, useUIStore } from '#/common/store'
// import { setSearchPlaceholder } from '../../NavBar/NavBarSearch'
import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'
import { FINLAND_BOUNDS } from '#/common/constants/map'
import useSelectedFeaturesFilteredByLayer from '#/common/hooks/map/useSelectedFeaturesFilteredByLayer'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import { SidebarDrawerContainer } from '#/components/Sidebar/SidebarDrawerContainer'
import { SidebarContentBox } from '#/components/Sidebar'
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
  const fitBounds = useMapStore((state) => state.fitBounds)
  const removeSelectedFeatures = useMapStore(
    (state) => state.removeSelectedFeatures
  )

  const isSidebarDrawerOpen = useUIStore((state) => state.isSidebarDrawerOpen)
  const setIsSidebarDrawerOpen = useUIStore(
    (state) => state.setIsSidebarDrawerOpen
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
              sx={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                columnGap: 0.5,
                rowGap: 0,
              }}
            >
              <Typography
                component="span"
                variant="body2"
                sx={{ fontWeight: 'inherit', lineHeight: 1.4 }}
              >
                Average carbon balance
                <Tooltip
                  arrow
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
                >
                  <Info
                    sx={{
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <SidebarContentBox>
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
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
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
                          sx={{
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
                  <Typography variant="body2" sx={{ ml: 1.5 }}>
                    Select a forest area to explore its carbon report. You can
                    zoom in and out to view different levels.
                  </Typography>
                </Box>
              )}
              <SwitchWithLabel
                sx={{ mt: 7 }}
                checked={perHectareFlag}
                onChange={(event) => {
                  onChangeCheckbox(setPerHectareFlag)(event)
                  setReportPanelOpen(true)
                }}
              >
                Show values per hectare
              </SwitchWithLabel>
              <SwitchWithLabel
                sx={{ mt: 2 }}
                checked={carbonBalanceDifferenceFlag}
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
                      setForestryMethod(Number(event.target.value))
                    }}
                    sx={{ width: '100%' }}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'start',
                      gap: 1,
                      flexWrap: 'wrap',
                      textAlign: { xs: 'center', sm: 'left' },
                    }}
                  >
                    <Typography
                      typography="body2"
                      sx={{ fontSize: '0.675rem' }}
                    >
                      Scientific forest model by
                    </Typography>
                    <Link
                      href="https://arvometsa.fi"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'inline-flex', alignItems: 'center' }}
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

      {options != null && (
        <SidebarDrawerContainer>
          <SidebarContentBox
            sxOuter={{
              width: '30rem',
              maxWidth: '100%',
              minWidth: 0,
            }}
          >
            <SwitchWithLabel
              sx={{ mb: 7 }}
              checked={cumulativeFlag}
              onChange={onChangeCheckbox(setCumulativeFlag)}
            >
              Show cumulative carbon balance
            </SwitchWithLabel>
            {hasFeature && (
              <>
                <Box
                  sx={{
                    mt: 1,
                    backgroundColor: 'neutral.light',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
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
                  <Box sx={{ mt: 3 }}>
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
                  <Typography
                    variant="body2"
                    sx={{
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
                        sx={{
                          color: 'action.active',
                          width: 16,
                          height: 16,
                          ml: 0.5,
                          mb: 0.2,
                        }}
                      />
                    </Tooltip>
                  </Typography>
                  <Box sx={{ mt: 3 }}>
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
                  <Typography
                    variant="body2"
                    sx={{
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
                  <Box sx={{ mt: 3 }}>
                    <FinlandForestsChart
                      options={options.wood.chartOptions.options}
                      data={options.wood.chartOptions.data}
                    />
                  </Box>
                </Box>
              </>
            )}
          </SidebarContentBox>
        </SidebarDrawerContainer>
      )}
      {hasFeature && !isSidebarDrawerOpen && (
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            pl: SIDEBAR_PADDING_REM + 'rem',
            pr: SIDEBAR_PADDING_REM + 'rem',
            pt: 2,
            pb: 2,
            position: 'sticky',
            bottom: 0,
            zIndex: theme.zIndex.drawer + 1,
            borderTop: 1,
            borderColor: 'primary.lighter',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            onClick={() => setIsSidebarDrawerOpen(true)}
            sx={{
              mt: 1.3,
              display: 'inline-flex',
              flexDirection: 'row',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'neutral.dark',
              flex: 0,
              whiteSpace: 'nowrap',
              alignSelf: 'flex-end',
              gap: 0.75,
            }}
          >
            <Typography
              sx={{
                typography: 'h3',
              }}
            >
              Show graphs
            </Typography>
            <BarChartIcon fontSize="large" />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default FinlandForests
