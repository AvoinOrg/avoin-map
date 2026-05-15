import type { MapGeoJSONFeature } from 'maplibre-gl'

import {
  ENERGYMAP_BUILDING_KEY_PROPERTY,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
} from '../layers/buildingSource'
import type {
  EnergymapSelectedBuilding,
  EnergymapSelectedBuildingProperties,
} from './types'

type EnergymapBuildingMapFeature = MapGeoJSONFeature & {
  source: typeof ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID
  sourceLayer: typeof ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER
}

const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number'

const copyFeatureProperties = (
  properties: MapGeoJSONFeature['properties']
): EnergymapSelectedBuildingProperties => {
  if (properties == null) {
    return {}
  }

  return { ...properties } as EnergymapSelectedBuildingProperties
}

export const isEnergymapBuildingFeature = (
  feature: MapGeoJSONFeature
): feature is EnergymapBuildingMapFeature =>
  feature.source === ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID &&
  feature.sourceLayer === ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER

export const toEnergymapSelectedBuilding = (
  feature: MapGeoJSONFeature
): EnergymapSelectedBuilding | null => {
  if (!isEnergymapBuildingFeature(feature)) {
    return null
  }

  const properties = copyFeatureProperties(feature.properties)
  const idValue = feature.id ?? properties[ENERGYMAP_BUILDING_KEY_PROPERTY]

  if (!isStringOrNumber(idValue)) {
    return null
  }

  const buildingKeyValue = properties[ENERGYMAP_BUILDING_KEY_PROPERTY] ?? idValue

  if (!isStringOrNumber(buildingKeyValue)) {
    return null
  }

  return {
    id: String(idValue),
    buildingKey: String(buildingKeyValue),
    source: feature.source,
    sourceLayer: feature.sourceLayer,
    layerId: feature.layer.id,
    properties,
  }
}

const arePropertiesEqual = (
  first: EnergymapSelectedBuildingProperties,
  second: EnergymapSelectedBuildingProperties
): boolean => {
  const firstKeys = Object.keys(first)
  const secondKeys = Object.keys(second)

  if (firstKeys.length !== secondKeys.length) {
    return false
  }

  return firstKeys.every((key) => Object.is(first[key], second[key]))
}

export const areEnergymapSelectedBuildingsEqual = (
  first: EnergymapSelectedBuilding | null,
  second: EnergymapSelectedBuilding | null
): boolean => {
  if (first == null || second == null) {
    return first === second
  }

  return (
    first.id === second.id &&
    first.buildingKey === second.buildingKey &&
    first.source === second.source &&
    first.sourceLayer === second.sourceLayer &&
    first.layerId === second.layerId &&
    arePropertiesEqual(first.properties, second.properties)
  )
}
