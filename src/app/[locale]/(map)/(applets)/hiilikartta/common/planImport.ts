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

type FormatImportedGeojsonArgs = {
  json: FeatureCollection
  zoningColName: string
  nameColName?: string
  zoningClasses: ZoningClass[]
}

type FormattedImportedFeature = Feature<Geometry, FeatureProperties>

export const formatImportedGeojson = ({
  json,
  zoningColName,
  nameColName,
  zoningClasses,
}: FormatImportedGeojsonArgs): FeatureCollection => {
  const features = json.features
    .map<FormattedImportedFeature | null>((feature: Feature, index) => {
      if (
        !feature.geometry ||
        // @ts-ignore geometry narrowing for uploaded data
        !feature.geometry.coordinates ||
        !['MultiPolygon', 'Polygon'].includes(feature.geometry.type)
      ) {
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
        properties,
      }
    })
    .filter(
      (feature): feature is FormattedImportedFeature => feature !== null
    )

  return {
    type: 'FeatureCollection',
    features,
  }
}

export const getImportedPlanAreaHa = (json: FeatureCollection) => {
  return getGeoJsonArea(json) / 10000
}
