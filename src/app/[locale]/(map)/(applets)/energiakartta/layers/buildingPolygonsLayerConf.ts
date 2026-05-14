import type { ExpressionSpecification, FilterSpecification } from 'maplibre-gl'

import { ExtendedStyleSpecification, LayerConf } from '#/common/types/map'
import { ENERGYMAP_GEOSERVER_URL } from './geoServer'

export const ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID =
  'energymap_building_polygons'
export const ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID = `${ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID}-fill`
export const ENERGYMAP_BUILDING_POLYGONS_OUTLINE_LAYER_ID = `${ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID}-outline`
export const ENERGYMAP_BUILDING_POLYGONS_LAYER_IDS = [
  ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID,
  ENERGYMAP_BUILDING_POLYGONS_OUTLINE_LAYER_ID,
] as const
export const ENERGYMAP_BUILDING_POLYGONS_WORKSPACE = 'sandbox_energiakartta'
export const ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER =
  'energymap_building_polygons'

export const ENERGYMAP_BUILDING_KEY_PROPERTY = 'building_key'
export const ENERGYMAP_BUILDING_TYPE_PROPERTY = 'main_purpose'
export const ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY = 'completion_date'
export const ENERGYMAP_BUILDING_TYPE_FILTER_ALL = 'all'
export const ENERGYMAP_CONSTRUCTION_YEAR_FILTER_ANY = 'any'
export const ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE = null

export const ENERGYMAP_BUILDING_TYPE_CODES = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
] as const

export type EnergymapBuildingTypeCode =
  (typeof ENERGYMAP_BUILDING_TYPE_CODES)[number]

export type EnergymapBuildingTypeFilter =
  | typeof ENERGYMAP_BUILDING_TYPE_FILTER_ALL
  | EnergymapBuildingTypeCode

export type EnergymapSelectedConstructionDecade = number | null

export type EnergymapBuildingFilterState = {
  buildingTypeFilter: EnergymapBuildingTypeFilter
  selectedConstructionDecade: EnergymapSelectedConstructionDecade
  showBuildingsFromSelectedDecade: boolean
  showOnlySelectedDecade: boolean
}

export type EnergymapConstructionDecadeOption = {
  value: string
  label: string
  startYear: number
  endYear: number
}

export const getConstructionDecadeOptions = (
  currentYear = new Date().getFullYear()
): EnergymapConstructionDecadeOption[] => {
  const currentDecade = Math.floor(currentYear / 10) * 10

  return Array.from(
    { length: (currentDecade - 1900) / 10 + 1 },
    (_item, index) => {
      const startYear = 1900 + index * 10
      const endYear = startYear + 9

      return {
        value: String(startYear),
        label: `${startYear} - ${endYear}`,
        startYear,
        endYear,
      }
    }
  )
}

export const ENERGYMAP_CONSTRUCTION_DECADE_OPTIONS =
  getConstructionDecadeOptions()

export const ENERGYMAP_BUILDING_MATCH_ALL_FILTER = [
  'has',
  ENERGYMAP_BUILDING_KEY_PROPERTY,
] as FilterSpecification

const completionYearExpression: ExpressionSpecification = [
  'to-number',
  [
    'slice',
    ['to-string', ['get', ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY]],
    0,
    4,
  ],
  -1,
]

export const combineMapFilters = (
  filters: (FilterSpecification | null | undefined | false)[]
): FilterSpecification => {
  const activeFilters = filters.filter(Boolean) as FilterSpecification[]

  if (activeFilters.length === 0) {
    return ENERGYMAP_BUILDING_MATCH_ALL_FILTER
  }

  if (activeFilters.length === 1) {
    return activeFilters[0]
  }

  return ['all', ...activeFilters] as FilterSpecification
}

export const getEnergymapBuildingTypeFilter = (
  buildingTypeFilter: EnergymapBuildingTypeFilter
): FilterSpecification | null => {
  if (buildingTypeFilter === ENERGYMAP_BUILDING_TYPE_FILTER_ALL) {
    return null
  }

  return [
    '==',
    ['get', ENERGYMAP_BUILDING_TYPE_PROPERTY],
    buildingTypeFilter,
  ] as FilterSpecification
}

export const getEnergymapConstructionYearFilter = ({
  selectedConstructionDecade,
  showBuildingsFromSelectedDecade,
  showOnlySelectedDecade,
}: Pick<
  EnergymapBuildingFilterState,
  | 'selectedConstructionDecade'
  | 'showBuildingsFromSelectedDecade'
  | 'showOnlySelectedDecade'
>): FilterSpecification | null => {
  if (selectedConstructionDecade == null) {
    return null
  }

  if (showOnlySelectedDecade) {
    return [
      'all',
      ['>=', completionYearExpression, selectedConstructionDecade],
      ['<', completionYearExpression, selectedConstructionDecade + 10],
    ] as FilterSpecification
  }

  if (showBuildingsFromSelectedDecade) {
    return [
      '>=',
      completionYearExpression,
      selectedConstructionDecade,
    ] as FilterSpecification
  }

  return null
}

export const getEnergymapBuildingFilter = (
  state: EnergymapBuildingFilterState
): FilterSpecification => {
  return combineMapFilters([
    getEnergymapBuildingTypeFilter(state.buildingTypeFilter),
    getEnergymapConstructionYearFilter(state),
  ])
}

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
    sources: {
      [ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID]: {
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
        id: ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID,
        source: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'fill',
        paint: {
          'fill-color': '#7DAD46',
          'fill-opacity': 0.45,
        },
      },
      {
        id: ENERGYMAP_BUILDING_POLYGONS_OUTLINE_LAYER_ID,
        source: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'line',
        minzoom: 11,
        paint: {
          'line-color': '#111111',
          'line-opacity': 0.65,
          'line-width': 1,
        },
      },
    ],
  }
}

const layerConf: LayerConf = {
  id: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
  style: getStyle,
}

export default layerConf
