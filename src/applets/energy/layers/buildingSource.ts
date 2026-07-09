import type { ExtendedSourceSpecification } from '#/common/types/map'
import { ENERGYMAP_GEOSERVER_URL } from './geoServer'

export const ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID =
  'energymap_building_polygons'
export const ENERGYMAP_BUILDING_POLYGONS_WORKSPACE = 'sandbox_energiakartta'
export const ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER =
  'energymap_building_polygons'
export const ENERGYMAP_BUILDING_KEY_PROPERTY = 'building_key'
export const ENERGYMAP_BUILDING_POLYGONS_SOURCE_MIN_ZOOM = 12
export const ENERGYMAP_BUILDING_POLYGONS_SOURCE_MAX_ZOOM = 17
export const ENERGYMAP_BUILDING_POLYGONS_LAYER_MIN_ZOOM =
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_MIN_ZOOM
// MapLibre layer maxzoom is exclusive, so 18 keeps zoom 17 visible.
export const ENERGYMAP_BUILDING_POLYGONS_LAYER_MAX_ZOOM = 18

export const getEnergymapBuildingPolygonsTileUrl = () =>
  `${ENERGYMAP_GEOSERVER_URL}/gwc/service/tms/1.0.0/${ENERGYMAP_BUILDING_POLYGONS_WORKSPACE}:${ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`

export const createEnergymapBuildingPolygonsSource =
  (): ExtendedSourceSpecification => ({
    type: 'vector',
    scheme: 'tms',
    tiles: [getEnergymapBuildingPolygonsTileUrl()],
    minzoom: ENERGYMAP_BUILDING_POLYGONS_SOURCE_MIN_ZOOM,
    maxzoom: ENERGYMAP_BUILDING_POLYGONS_SOURCE_MAX_ZOOM,
    bounds: [19, 59, 32, 71],
    promoteId: ENERGYMAP_BUILDING_KEY_PROPERTY,
  })
