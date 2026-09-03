import type { ExpressionSpecification } from 'maplibre-gl'

import type { ExtendedLayerSpecification } from '#/common/types/map'
import {
  ENERGYMAP_BUILDING_POLYGONS_LAYER_MAX_ZOOM,
  ENERGYMAP_BUILDING_POLYGONS_LAYER_MIN_ZOOM,
} from './buildingSource'

export const ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID =
  'energymap_energy_certificates'
export const ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID = `${ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID}-fill`
export const ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID = `${ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID}-outline`
export const ENERGYMAP_ENERGY_CERTIFICATE_LAYER_IDS = [
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
  ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
] as const
export const ENERGYMAP_ENERGY_CERTIFICATE_FILL_OPACITY = 0.62
export const ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_OPACITY = 0.35

export const ENERGY_CLASS_PROPERTY = 'energy_class'
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
    ['get', ENERGY_CLASS_PROPERTY],
    ...matchStops,
    ENERGY_CERTIFICATE_INACTIVE_COLOR,
  ]

  return expression as unknown as ExpressionSpecification
}

export const createEnergymapEnergyCertificateLayers = ({
  sourceId,
  sourceLayer,
}: {
  sourceId: string
  sourceLayer: string
}): ExtendedLayerSpecification[] => {
  const fillColorExpression = getEnergyCertificateFillColorExpression(
    ENERGY_CERTIFICATE_CLASS_CODES
  )

  return [
    {
      id: ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
      source: sourceId,
      'source-layer': sourceLayer,
      type: 'fill',
      minzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MIN_ZOOM,
      maxzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MAX_ZOOM,
      layout: {
        visibility: 'none',
      },
      paint: {
        'fill-color': fillColorExpression,
        'fill-opacity': 0,
      },
    },
    {
      id: ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
      source: sourceId,
      'source-layer': sourceLayer,
      type: 'line',
      minzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MIN_ZOOM,
      maxzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MAX_ZOOM,
      layout: {
        visibility: 'none',
      },
      paint: {
        'line-color': fillColorExpression,
        'line-opacity': 0,
        'line-width': 0.75,
      },
    },
  ]
}
