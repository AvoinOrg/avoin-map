import { buffer } from '@turf/turf'
import booleanValid from '@turf/boolean-valid'
import { Feature, FeatureCollection, Geometry } from 'geojson'
import { flattenDeep } from 'lodash-es'

import { getGeoJsonArea } from '#/common/utils/gis'
import { generateUUID } from '#/common/utils/general'

import {
  FeatureProperties,
  ZoningClass,
  ZONING_CODE_COL,
} from './types'
import {
  getZoningClassLandUseDefaults,
  normalizeZoningCode,
} from './zoningClasses'

export class PlanImportValidationError extends Error {
  code: 'unsupported-geometry' | 'no-editable-polygons'

  constructor(
    code: 'unsupported-geometry' | 'no-editable-polygons',
    message: string
  ) {
    super(message)
    this.name = 'PlanImportValidationError'
    this.code = code
  }
}

type FormatImportedGeojsonArgs = {
  json: FeatureCollection
  zoningColName: string
  nameColName?: string
  zoningClasses: ZoningClass[]
}

type FormattedImportedFeature = Feature<Geometry, FeatureProperties>

const getImportGeometryError = (feature: Feature) => {
  if (!feature.geometry) {
    return 'Feature has no geometry'
  }

  if (
    // @ts-ignore geometry narrowing for uploaded data
    !feature.geometry.coordinates
  ) {
    return 'Feature has no coordinates'
  }

  if (!['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) {
    return `Feature geometry type ${feature.geometry.type} is not supported`
  }

  if (
    // @ts-ignore geometry narrowing for uploaded data
    !Array.isArray(feature.geometry.coordinates)
  ) {
    return 'Feature coordinates is not an array'
  }

  return null
}

const flattenFeatures = (features: Feature[]): Feature[] => {
  return features.flatMap((feature) => {
    if (feature.geometry?.type === 'MultiPolygon') {
      // @ts-ignore geometry narrowing for uploaded data
      return feature.geometry.coordinates.map(
        (coords: number[][][]) => ({
          ...feature,
          geometry: {
            type: 'Polygon' as const,
            coordinates: coords,
          },
        })
      )
    }
    return [feature]
  })
}

export const formatImportedGeojson = ({
  json,
  zoningColName,
  nameColName,
  zoningClasses,
}: FormatImportedGeojsonArgs): FeatureCollection => {
  const unsupportedFeatureIndexes: number[] = []
  const flattenedFeatures = flattenFeatures(json.features)
  const features = flattenedFeatures
    .map<FormattedImportedFeature | null>((feature: Feature, index) => {
      const initialGeometryError = getImportGeometryError(feature)
      if (initialGeometryError != null) {
        unsupportedFeatureIndexes.push(index + 1)
        return null
      }

      if (
        // @ts-ignore geometry narrowing for uploaded data
        feature.geometry.coordinates &&
        // @ts-ignore geometry narrowing for uploaded data
        (feature.geometry.coordinates.length === 0 ||
          // @ts-ignore geometry narrowing for uploaded data
          flattenDeep(feature.geometry.coordinates).length === 0)
      ) {
        return null
      }

      if (!booleanValid(feature)) {
        try {
          const fixedGeometry = buffer(feature, 0).geometry
          const fixedFeature = {
            ...feature,
            geometry: fixedGeometry,
          } as Feature

          const fixedGeometryError = getImportGeometryError(fixedFeature)
          if (fixedGeometryError != null) {
            unsupportedFeatureIndexes.push(index + 1)
            return null
          }

          if (booleanValid(fixedGeometry)) {
            feature.geometry = fixedGeometry
          } else {
            return null
          }
        } catch (error) {
          console.error('Error fixing geometry:', error)
          return null
        }
      }

      let zoningCode = feature.properties?.[zoningColName]

      if (!zoningCode) {
        zoningCode = null
      } else if (typeof zoningCode !== 'string') {
        zoningCode = String(zoningCode)
      }

      let name: string | number = index + 1
      if (nameColName != null) {
        const nameColVal = feature.properties?.[nameColName]
        if (
          (nameColVal != null && typeof nameColVal === 'string') ||
          typeof nameColVal === 'number'
        ) {
          name = feature.properties?.[nameColName]
        }
      }

      const featureAreaHa = getGeoJsonArea(feature) / 10000

      const baseProperties = {
        id: generateUUID(),
        name,
        [ZONING_CODE_COL]: zoningCode,
        area_ha: featureAreaHa,
        old_id: feature.id != null ? feature.id : undefined,
      }

      let properties: FeatureProperties = {
        ...baseProperties,
        extras: { hasValidZoningCode: false },
      }

      if (zoningCode != null) {
        const trimmedZoningCode = normalizeZoningCode(zoningCode)

        const zoningClass = zoningClasses.find((currentZoningClass) => {
          const codes = currentZoningClass.code
            .split(',')
            .map((code) => normalizeZoningCode(code))
          return codes.includes(trimmedZoningCode)
        })

        if (zoningClass) {
          properties = {
            ...baseProperties,
            [ZONING_CODE_COL]: zoningClass.code,
            old_zoning_code: zoningCode,
            extras: { hasValidZoningCode: true },
            ...getZoningClassLandUseDefaults(zoningClass),
          }
        }
      }

      return {
        ...feature,
        id: properties.id,
        properties,
      }
    })
    .filter(
      (feature): feature is FormattedImportedFeature => feature !== null
    )

  if (unsupportedFeatureIndexes.length > 0) {
    throw new PlanImportValidationError(
      'unsupported-geometry',
      'Imported file contains geometries that Hiilikartta cannot edit. Only polygons without holes are supported.'
    )
  }

  if (features.length === 0) {
    throw new PlanImportValidationError(
      'no-editable-polygons',
      'Imported file did not contain any editable polygons.'
    )
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}

export const getImportedPlanAreaHa = (json: FeatureCollection) => {
  return getGeoJsonArea(json) / 10000
}
