import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Map,
  GeoJSONSource,
  StyleSpecification,
  type MapMouseEvent,
} from 'maplibre-gl'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'
import TText from '#/components/common/TText'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import { getCombinedBoundsInLngLat } from '#/common/utils/gis'

import {
  GraphCalcType,
  MapGraphCalcFeature,
  MapGraphData,
  MapGraphDataSelectOption,
  ZONING_CODE_COL,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import {
  isZoningCodeValidExpression,
  zoningFillColorExpression,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import { mergeArraysAlternate, pp } from '#/common/utils/general'
import { Cross } from '#/components/icons'
import { osmBackgroundLayerConf } from '#/components/Map/layers/common/OSM/background'

const SERVER_URL = process.env.NEXT_PUBLIC_GEOSERVER_URL
// const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

type Props = {
  datas: MapGraphData[]
  activeYear: string
  featureYears: string[]
  setActiveYear: (year: string) => void
  activeDataOption: MapGraphDataSelectOption
  setActiveDataOption: (option: MapGraphDataSelectOption) => void
  activeCalcType: GraphCalcType
  activeAreaType: string
}

const CarbonMapGraphMap = ({
  datas,
  activeYear,
  featureYears,
  setActiveYear,
  activeDataOption,
  setActiveDataOption,
}: Props) => {
  const { t } = useTranslate('hiilikartta')
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    feature: MapGraphCalcFeature | null
    x: number
    y: number
  }>({
    visible: false,
    feature: null,
    x: 0,
    y: 0,
  })
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<Map | null>(null)
  const [mapIsLoaded, setMapIsLoaded] = useState(false)
  const allDataIds = useRef<string[]>([])
  const selectOptions = useMemo(() => {
    const currentSituationAppendix = ` (${t(
      'report.general.current_situation'
    )})`
    const datasCurrent = datas.map((data) => ({
      id: data.id,
      name: data.name + currentSituationAppendix,
      isCurrent: true,
    }))
    const datasPlanned = datas.map((data) => ({
      id: data.id,
      name: data.name,
      isCurrent: false,
    }))
    return mergeArraysAlternate(datasPlanned, datasCurrent)
  }, [datas, t])

  useEffect(() => {
    let isCancelled = false
    let mapInstance: Map | null = null

    const initMap = async () => {
      if (map.current || !mapContainer.current) return // Initialize the map only once

      setMapIsLoaded(false)

      const styleDefinition = osmBackgroundLayerConf.style
      const baseStyle =
        typeof styleDefinition === 'function'
          ? await styleDefinition()
          : styleDefinition

      if (isCancelled || !mapContainer.current) return

      const style = {
        ...baseStyle,
        ...(baseStyle.glyphs == null && SERVER_URL
          ? { glyphs: `${SERVER_URL}/www/font/{fontstack}/{range}.pbf` }
          : {}),
      } as StyleSpecification

      mapInstance = new Map({
        container: mapContainer.current,
        style,
        center: [0, 0], // Specify the initial map center coordinates
        zoom: 2, // Specify the initial zoom level
      })

      map.current = mapInstance

      mapInstance.on('load', () => {
        if (isCancelled) return
        setMapIsLoaded(true)
        mapInstance?.resize()
      })
    }

    initMap()

    return () => {
      isCancelled = true
      if (mapInstance) {
        mapInstance.remove()
      }
      if (map.current === mapInstance) {
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapIsLoaded || !map.current) {
      return
    }

    // Remove old GeoJSON data
    const dataIds = datas.map((data) => data.id)
    // Check if bounds need to be reset
    if (
      allDataIds.current.length != dataIds.length ||
      !dataIds.every((dataId) => allDataIds.current.includes(dataId))
    ) {
      const bounds = getCombinedBoundsInLngLat(datas.map((data) => data.data))
      if (bounds) {
        // map.current?.setMaxBounds(paddedBounds)
        map.current?.fitBounds(bounds, {
          padding: 20,
        })
      }
    }
    allDataIds.current.forEach((dataId) => {
      if (!dataIds.includes(dataId)) {
        map.current!.removeLayer(`carbon-graph-layer-${dataId}`)
        map.current!.removeLayer(`carbon-graph-layer-${dataId}-symbol`)
        map.current!.removeSource(`carbon-graph-source-${dataId}`)
      }
    })

    allDataIds.current = dataIds

    datas.forEach((data) => {
      const sourceId = `carbon-graph-source-${data.id}`
      const layerId = `carbon-graph-layer-${data.id}`

      if (map.current!.getSource(sourceId)) {
        ;(map.current!.getSource(sourceId) as GeoJSONSource).setData(data.data)

        if (data.id === activeDataOption.id) {
          map.current!.setLayoutProperty(layerId, 'visibility', 'visible')
          map.current!.setLayoutProperty(
            `${layerId}-symbol`,
            'visibility',
            'visible'
          )
          map.current!.setFilter(layerId, ['!=', 'isHidden', true])
          map.current!.setFilter(`${layerId}-symbol`, [
            '!=',
            'isHidden',
            true,
          ])
          if (activeDataOption.isCurrent) {
            map.current!.setFilter(`${layerId}-symbol`, [
              '!=',
              'isHidden',
              false,
            ])
          }
          map.current!.setPaintProperty(
            layerId,
            'fill-color',
            zoningFillColorExpression()
          )
        } else {
          map.current!.setLayoutProperty(layerId, 'visibility', 'none')
          map.current!.setLayoutProperty(
            `${layerId}-symbol`,
            'visibility',
            'none'
          )
        }
      } else {
        map.current!.addSource(sourceId, {
          type: 'geojson',
          data: data.data,
        })

        map.current!.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          layout: {
            visibility: data.id === activeDataOption.id ? 'visible' : 'none',
          },
          paint: {
            'fill-color': zoningFillColorExpression(),
            'fill-opacity': 0.9,
            'fill-outline-color': '#274AFF',
          },
        })

        map.current!.addLayer({
          id: `${layerId}-symbol`,
          source: sourceId,
          type: 'symbol',
          layout: {
            'symbol-placement': 'point',
            'text-size': 20,
            'text-font': ['Open Sans Regular'],
            'text-field': [
              'case',
              ['==', ['get', ZONING_CODE_COL], 'none'],
              '',
              isZoningCodeValidExpression(),
              ['get', ZONING_CODE_COL],
              '!',
            ],
          },
          paint: {
            'text-color': 'black',
            'text-halo-blur': 1,
            'text-halo-color': 'rgb(242,243,240)',
            'text-halo-width': 2,
          },
          minzoom: 12,
        })

        if (activeDataOption.isCurrent) {
          map.current!.setFilter(`${layerId}-symbol`, [
            '!=',
            'isHidden',
            false,
          ])
        }
      }
    })
  }, [mapIsLoaded, datas, activeDataOption])

  useEffect(() => {
    if (map.current != null) {
      const layerId = `carbon-graph-layer-${activeDataOption.id}`
      const handleMouseEnter = () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      }
      const handleMouseLeave = () => {
        map.current!.getCanvas().style.cursor = ''
      }
      map.current.on('mouseenter', layerId, handleMouseEnter)
      map.current.on('mouseleave', layerId, handleMouseLeave)

      const handleFeatureClick = (e: MapMouseEvent) => {
        if (map.current != null) {
          const features = map.current.queryRenderedFeatures(e.point)
          if (features.length > 0) {
            const feature = features[0] as unknown as MapGraphCalcFeature
            if (feature && feature.properties) {
              setTooltip({
                visible: true,
                feature: feature,
                x: e.point.x,
                y: e.point.y,
              })
            }
          } else {
            setTooltip((prev) => ({ ...prev, visible: false }))
          }
        }
      }
      map.current.on('click', handleFeatureClick)

      return () => {
        if (map.current) {
          map.current.off('click', handleFeatureClick)
          map.current.off('mouseenter', layerId, handleMouseEnter)
          map.current.off('mouseleave', layerId, handleMouseLeave)
        }
      }
    }
  }, [mapIsLoaded, activeDataOption.id, activeDataOption.isCurrent])

  const handlePlanSelectClick = (data: MapGraphDataSelectOption) => {
    setActiveDataOption(data)
  }

  return (
    <Box
      style={{
        height: '400px',
        width: '100%',
        position: 'relative',
      }}
    >
      <Box ref={mapContainer} style={{ height: '100%', width: '100%' }} />

      <Box
        sx={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000, // ensure it's above the map layers
          height: '2rem',
          backgroundColor: 'neutral.lighter',
          borderRadius: '1rem',
          opacity: 0.85,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pl: 2,
          pr: 2,
        }}
      >
        <DropDownSelectMinimal
          ariaLabel="Select map graph year"
          value={activeYear}
          options={featureYears.map((year) => ({
            label: year,
            value: year,
          }))}
          onChange={(event) => setActiveYear(event.target.value as string)}
        ></DropDownSelectMinimal>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
        }}
      >
        {selectOptions.map((option) => (
          <Box
            component="button"
            type="button"
            sx={{
              borderRadius: '0.3125rem',
              border: 'none',
              color: 'neutral.darker',
              pointerEvents: 'auto',
              backgroundColor: 'neutral.lighter',
              opacity: 0.85,
              mb: '0.5rem',
              maxWidth: '200px',
              display: 'flex',
              justifyContent: 'flex-start',
              height: '1.75rem',
              px: '0.5rem',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.95,
                backgroundColor: 'neutral.lighter',
              },
              '&:focus-visible': {
                outline: '2px solid rgba(39, 74, 255, 0.45)',
                outlineOffset: '2px',
              },
              ...(option.id === activeDataOption.id &&
                option.isCurrent === activeDataOption.isCurrent && {
                  border: '1px solid',
                  borderColor: 'secondary.dark',
                  color: 'secondary.dark',
                }),
            }}
            key={option.id + option.isCurrent}
            aria-label={`Show map graph data for ${option.name}`}
            onClick={() => handlePlanSelectClick(option)}
          >
            <Box
              component="span"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                typography: 'body2',
                letterSpacing: 'normal',
                fontSize: '0.75rem',
                lineHeight: 'normal',
              }}
            >
              {option.name}
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: tooltip.visible ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'absolute',
          left: tooltip.x - 11,
          top: tooltip.y + 10,
          zIndex: 1500, // Ensure it's above the map layers
          backgroundColor: 'white',
          // border: '1px solid #ddd', // Optional border
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', // Optional shadow
          borderRadius: '4px',
          padding: '10px',
          minWidth: '150px',
          pointerEvents: 'auto', // To allow clicking on the close button
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-17px', // Position the pointer above the tooltip box
            left: '3px', // Position the pointer towards the left of the tooltip box
            borderWidth: '10px',
            borderStyle: 'solid',
            borderColor: 'transparent transparent white transparent', // Point downwards
          },
        }}
      >
        {tooltip.feature && (
          <>
            <Box
              sx={{
                alignSelf: 'flex-end',
                flexDirection: 'row',
                cursor: 'pointer',
                width: '20px',
                height: '20px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'start',
              }}
            >
              <Box
                component="button"
                type="button"
                aria-label="Close map graph tooltip"
                sx={{
                  display: 'inline',
                  p: 0,
                  m: 0,
                  border: 'none',
                  background: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  setTooltip((prev) => ({ ...prev, visible: false }))
                }
              >
                <Cross sx={{ width: '15px', height: '15px' }}></Cross>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                component="table"
                sx={{
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    borderBottom: 'none',
                    p: '6px',
                    textAlign: 'left',
                  },
                }}
              >
                <Box component="tbody">
                  <Box component="tr" key={'zoning_code'}>
                    <FirstColumnCell>
                      <TText
                        ns="hiilikartta"
                        keyName="report.map_graph.tooltip_zoning_code"
                      />
                    </FirstColumnCell>
                    <DataCell key={'zoning_code_val'}>
                      {tooltip.feature.properties[ZONING_CODE_COL]}
                    </DataCell>
                  </Box>
                  <Box component="tr" key={'area'}>
                    <FirstColumnCell>
                      <TText
                        ns="hiilikartta"
                        keyName="report.map_graph.tooltip_area"
                      />
                    </FirstColumnCell>
                    <DataCell key={'zoning_code_val'}>
                      {pp(tooltip.feature.properties.area / 10000, 2)}
                    </DataCell>
                  </Box>
                  <Box component="tr" key={'co2_ha'}>
                    <FirstColumnCell>
                      <TText
                        ns="hiilikartta"
                        keyName="report.map_graph.unit_co2_ha_compared"
                      />
                    </FirstColumnCell>
                    <DataCell key={'co2_ha_val'}>
                      {pp(
                        activeDataOption.isCurrent
                          ? tooltip.feature.properties.valueHaNochange
                          : tooltip.feature.properties.valueHa,
                        0
                      )}
                    </DataCell>
                  </Box>
                  <Box component="tr" key={'co2_total'}>
                    <FirstColumnCell>
                      <TText
                        ns="hiilikartta"
                        keyName="report.map_graph.unit_co2_total_compared"
                      />
                    </FirstColumnCell>
                    <DataCell key={'co2_total_val'}>
                      {pp(
                        activeDataOption.isCurrent
                          ? tooltip.feature.properties.valueTotalNochange
                          : tooltip.feature.properties.valueTotal,
                        0
                      )}
                    </DataCell>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

const FirstColumnCell = ({ children }: { children: React.ReactNode }) => (
  <Box component="th" scope="row" sx={{ typography: 'body7' }}>
    {children}
  </Box>
)

const DataCell = ({
  children,
  sx,
}: {
  children: React.ReactNode
  sx?: PandaStyleProp
}) => (
  <Box
    component="td"
    sx={[
      {
        typography: 'body7',
        fontWeight: 'bold',
        letterSpacing: '0.125rem',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
)

export default CarbonMapGraphMap
