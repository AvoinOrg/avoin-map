import type { ExpressionSpecification } from 'maplibre-gl'

import { ExtendedStyleSpecification, LayerConf } from '#/common/types/map'
import { ENERGYMAP_GEOSERVER_URL } from './geoServer'
import {
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
  ENERGYMAP_BUILDING_POLYGONS_WORKSPACE,
} from './buildingPolygonsLayerConf'

export const ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID =
  'energymap_energy_certificates'
export const ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID = `${ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID}-fill`
export const ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID = `${ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID}-outline`
export const ENERGYMAP_ENERGY_CERTIFICATE_LAYER_IDS = [
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
  ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
] as const

export const ENERGY_CERTIFICATE_CLASS_PROPERTY = 'energy_certificate_class'
export const ENERGY_CERTIFICATE_INACTIVE_COLOR = '#BFBFBF'

export const ENERGY_CERTIFICATE_CLASS_CODES = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
] as const

export type EnergyCertificateClassCode =
  (typeof ENERGY_CERTIFICATE_CLASS_CODES)[number]

export const ENERGY_CERTIFICATE_CLASS_COLORS: Record<
  EnergyCertificateClassCode,
  string
> = {
  A: '#1F964A',
  B: '#7DAD46',
  C: '#CCD040',
  D: '#FFEA43',
  E: '#ECB234',
  F: '#D2621F',
  G: '#C70016',
}

export type EnergyCertificateFillColorExpression =
  | ExpressionSpecification
  | typeof ENERGY_CERTIFICATE_INACTIVE_COLOR

export const getEnergyCertificateFillColorExpression = (
  activeClasses: readonly EnergyCertificateClassCode[]
): EnergyCertificateFillColorExpression => {
  if (activeClasses.length === 0) {
    return ENERGY_CERTIFICATE_INACTIVE_COLOR
  }

  const activeClassSet = new Set(activeClasses)
  const matchStops = ENERGY_CERTIFICATE_CLASS_CODES.flatMap((classCode) =>
    activeClassSet.has(classCode)
      ? [classCode, ENERGY_CERTIFICATE_CLASS_COLORS[classCode]]
      : []
  )

  const expression = [
    'match',
    ['get', ENERGY_CERTIFICATE_CLASS_PROPERTY],
    ...matchStops,
    ENERGY_CERTIFICATE_INACTIVE_COLOR,
  ]

  return expression as unknown as ExpressionSpecification
}

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  const fillColorExpression = getEnergyCertificateFillColorExpression(
    ENERGY_CERTIFICATE_CLASS_CODES
  )

  return {
    version: 8,
    name: ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID,
    sources: {
      [ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID]: {
        type: 'vector',
        scheme: 'tms',
        tiles: [
          `${ENERGYMAP_GEOSERVER_URL}/gwc/service/tms/1.0.0/${ENERGYMAP_BUILDING_POLYGONS_WORKSPACE}:${ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
        ],
        minzoom: 5,
        maxzoom: 14,
        bounds: [19, 59, 32, 71],
      },
    },
    layers: [
      {
        id: ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
        source: ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'fill',
        paint: {
          'fill-color': fillColorExpression,
          'fill-opacity': 0.62,
        },
      },
      {
        id: ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
        source: ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'line',
        minzoom: 11,
        paint: {
          'line-color': fillColorExpression,
          'line-opacity': 0.35,
          'line-width': 0.75,
        },
      },
    ],
  }
}

const layerConf: LayerConf = {
  id: ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID,
  style: getStyle,
}

export default layerConf
