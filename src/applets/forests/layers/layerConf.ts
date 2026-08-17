import { fillOpacity } from '#/common/utils/map'
import {
  LayerGroupId,
  LayerConf,
  ExtendedStyleSpecification,
  ExtendedLayerSpecification,
  ExtendedSourceSpecification,
} from '#/common/types/map'
import { layerOptions } from 'applets/forests/constants'
import { LayerLevel } from 'applets/forests/types'
import {
  fiForestsAreaCO2FillColor,
  fiForestsCumulativeCO2eValueExpr,
  fiForestsTextfieldExpression,
} from 'applets/forests/utils'

const SERVER_URL = process.env.PUBLIC_GEOSERVER_URL

export const id: LayerGroupId = 'fi_forests'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  const sources: Record<string, ExtendedSourceSpecification> = {}
  let layers: ExtendedLayerSpecification[] = []

  for (const layerGroupId in layerOptions) {
    const options = layerOptions[layerGroupId]
    sources[layerGroupId] = {
      type: 'vector',
      scheme: 'tms',
      tiles: [
        `${SERVER_URL}/gwc/service/tms/1.0.0/forest:${options.serverId}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
      minzoom: options.minzoom,
      maxzoom: options.maxzoom,
      bounds: [19, 59, 32, 71], // Finland
      attribution:
        '<a href="https://www.metsaan.fi">© Finnish Forest Centre</a>',
      promoteId: 'id',
    }

    layers = [
      ...layers,
      {
        id: `${layerGroupId}-fill`,
        source: layerGroupId,
        'source-layer': options.serverId,
        type: 'fill',
        paint: {
          'fill-color': fiForestsAreaCO2FillColor(
            fiForestsCumulativeCO2eValueExpr
          ),
          'fill-opacity': 0.7,
        },
        ...(options.layerMinzoom != null && { minzoom: options.layerMinzoom }),
        ...(options.layerMaxzoom != null && { maxzoom: options.layerMaxzoom }),
        selectable: true,
        multiSelectable: true,
      },
      {
        id: `${layerGroupId}-outline`,
        source: layerGroupId,
        'source-layer': options.serverId,
        type: 'line',
        paint: {
          // 'line-blur': 0,
          // 'fill-antialias': false,
          'line-color': 'black',
          'line-width': 1,
        },
        ...(options.layerMinzoom != null && { minzoom: options.layerMinzoom }),
        ...(options.layerMaxzoom != null && { maxzoom: options.layerMaxzoom }),
      },
      {
        id: `${layerGroupId}_fill-highlighted`,
        source: layerGroupId,
        'source-layer': options.serverId,
        type: 'fill',
        // paint: {
        //   'fill-pattern': 'DiagonalCross',
        // },
        generatedFillPatternOptions: {
          patternId: 'ForwardDiagonal',
          colorRGBA: 'rgba(255,255,255,1)',
          backgroundColorRGBA: 'rgba(0,0,0,0)',
        },
        activeOn: 'selected',
        ...(options.layerMinzoom != null && { minzoom: options.layerMinzoom }),
        ...(options.layerMaxzoom != null && { maxzoom: options.layerMaxzoom }),
      },
      {
        id: `${layerGroupId}-highlighted`,
        source: layerGroupId,
        'source-layer': options.serverId,
        type: 'line',
        paint: {
          // 'line-outline-color': 'white',
          'line-width': 2,
          'line-color': 'white',
          'line-opacity': 1,
        },
        activeOn: 'hover-or-selected',
        ...(options.layerMinzoom != null && { minzoom: options.layerMinzoom }),
        ...(options.layerMaxzoom != null && { maxzoom: options.layerMaxzoom }),
      },
    ]

    if (layerGroupId === LayerLevel.Parcel) {
      layers.push({
        id: `${layerGroupId}-symbol`,
        source: layerGroupId,
        'source-layer': options.serverId,
        type: 'symbol' as const,
        paint: {},
        layout: {
          'text-size': 20,
          'symbol-placement': 'point',
          'text-font': ['Open Sans Regular'],
          'text-field': fiForestsTextfieldExpression(
            fiForestsCumulativeCO2eValueExpr
          ),
        },
        selectable: true,
        multiSelectable: true,
        ...(options.layerMinzoom != null && {
          minzoom: options.layerMinzoom,
        }),
        ...(options.layerMaxzoom != null && {
          maxzoom: options.layerMaxzoom,
        }),
      })
    }
  }

  return {
    version: 8,
    name: id,
    sources: sources,
    layers: layers,
  }
}

export const layerConf: LayerConf = {
  id: id,
  style: getStyle,
}
