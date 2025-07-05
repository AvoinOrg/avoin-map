import {
  Map,
  ExpressionSpecification,
  GeoJSONSource,
  MapGeoJSONFeature,
} from 'maplibre-gl'
// import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
// import Layer from 'ol/layer/Layer'
// import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer'
// import { asArray } from 'ol/color'
// import { packColor } from 'ol/renderer/webgl/shaders'
import { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import type { DrawMode as MaplibreDrawMode } from 'maplibre-gl-draw'
import { AllGeoJSON, center } from '@turf/turf'

import {
  LayerType,
  layerTypes,
  ExtendedStyleSpecificationOrFn,
  ExtendedStyleSpecification,
  LayerGroupOptions,
  LayerOptionsObj,
  DrawMode,
  LayerGroups,
  SourceOptions,
  EMBEDDED_PARAMS_URL_PREFIX,
  SelectionSource,
  ExtendedMapGeoJSONFeature,
} from '../types/map'
import { clone, uniqBy } from 'lodash-es'

const EMBEDDED_PARAMS_URL_SEPARATOR = '||'

export const fillOpacity = 0.65

// const defaultVectorStyles: any = {
//   LineString: new Style({
//     stroke: new Stroke({
//       color: 'green',
//       width: 1,
//     }),
//   }),
//   MultiLineString: new Style({
//     stroke: new Stroke({
//       color: 'green',
//       width: 1,
//     }),
//   }),
//   MultiPolygon: new Style({
//     stroke: new Stroke({
//       color: 'yellow',
//       width: 1,
//     }),
//     fill: new Fill({
//       color: 'rgba(255, 255, 0, 0.1)',
//     }),
//   }),
//   Polygon: new Style({
//     stroke: new Stroke({
//       color: 'blue',
//       lineDash: [4],
//       width: 3,
//     }),
//     fill: new Fill({
//       color: 'rgba(0, 0, 255, 0.1)',
//     }),
//   }),
//   GeometryCollection: new Style({
//     stroke: new Stroke({
//       color: 'magenta',
//       width: 2,
//     }),
//     fill: new Fill({
//       color: 'magenta',
//     }),
//     image: new CircleStyle({
//       radius: 10,
//       fill: undefined,
//       stroke: new Stroke({
//         color: 'magenta',
//       }),
//     }),
//   }),
//   Circle: new Style({
//     stroke: new Stroke({
//       color: 'red',
//       width: 2,
//     }),
//     fill: new Fill({
//       color: 'rgba(255,0,0,0.2)',
//     }),
//   }),
// }

// export const defaultVectorStyleFunction = (feature: any) => {
//   return defaultVectorStyles[feature.getGeometry().getType()]
// }

// export class WebGLLayer extends Layer {
//   createRenderer = (): any => {
//     return new WebGLVectorLayerRenderer(this, {
//       fill: {
//         attributes: {
//           color: (feature: any) => {
//             const color = asArray(feature.get('COLOR') || '#eee')
//             color[3] = 0.85
//             return packColor(color)
//           },
//           opacity: () => {
//             return 0.6
//           },
//         },
//       },
//       stroke: {
//         attributes: {
//           color: (feature: any) => {
//             const color = [...asArray(feature.get('COLOR') || '#eee')]
//             color.forEach((_, i) => (color[i] = Math.round(color[i] * 0.75))) // darken slightly
//             return packColor(color)
//           },
//           width: () => {
//             return 1.5
//           },
//           opacity: () => {
//             return 1
//           },
//         },
//       },
//     })
//   }
// }

export const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += ('00' + value.toString(16)).substr(-2)
  }

  return colour
}

export const getColorExpressionArrForValues = (values: any[]) => {
  let colorArr: string[] = []

  values.forEach((value) => {
    colorArr.push(value)
    colorArr.push(stringToColor(value))
  })

  return colorArr
}

// NB: By using the '/' operator instead of '*', we get rid of float bugs like 1.2000000000004.
export const roundToSignificantDigitsPosExpr = (
  n: number,
  expr: ExpressionSpecification
) => [
  // Multiply back by true scale
  '/',
  // Round to two significant digits:
  ['round', ['/', expr, ['^', 10, ['+', -n + 1, ['floor', ['log10', expr]]]]]],
  ['^', 10, ['-', n - 1, ['floor', ['log10', expr]]]],
]
export const roundToSignificantDigitsExpr = (
  n: number,
  expr: ExpressionSpecification
) =>
  // @ts-ignore
  [
    'case',
    ['==', 0, expr],
    0,
    ['>', 0, expr],
    ['*', -1, roundToSignificantDigitsPosExpr(n, ['*', -1, expr])],
    roundToSignificantDigitsPosExpr(n, expr),
  ] as ExpressionSpecification

export const getCombinedBounds = (features: MapGeoJSONFeature[]) => {
  const coords = features.map((f) => {
    const g: any = f.geometry
    return g.coordinates
  })

  return coords.reduce(
    ([a1, b1, c1, d1], [a2, b2, c2, d2]) => [
      Math.min(a1, a2),
      Math.min(b1, b2),
      Math.max(c1, c2),
      Math.max(d1, d2),
    ],
    [999, 999, -999, -999] // fallback bounds
  )
}

export const getCoordinateFromGeometry = (
  geometry: Geometry
): Position | null => {
  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates as Position
    case 'LineString':
    case 'Polygon':
      return geometry.coordinates[0] as Position
    case 'MultiPoint':
    case 'MultiLineString':
    case 'MultiPolygon':
      return geometry.coordinates[0][0] as Position
    case 'GeometryCollection':
      if (geometry.geometries.length > 0) {
        return getCoordinateFromGeometry(geometry.geometries[0])
      }
      return null
    default:
      return null
  }
}

export const positionToLngLatLike = (
  position: Position
): mapboxgl.LngLatLike => {
  return { lng: position[0], lat: position[1] }
}

export const getLayerType = (layerGroupId: string): LayerType => {
  const suffix = layerGroupId.split('-').slice(-1)[0]
  if (layerTypes.includes(suffix)) {
    return suffix as LayerType
  }

  console.error(
    'Invalid layer type: "' +
      suffix +
      '" for layer: ' +
      layerGroupId +
      '". Valid types are: ' +
      layerTypes.join(', ')
  )
  return 'invalid'
}

export const getLayerName = (layerGroupId: string): LayerType => {
  const layerGroupIdSplitArr = layerGroupId.split('-')
  if (layerGroupIdSplitArr.length > 2) {
    console.error(
      'Invalid layer id. Only use hyphen ("-") to separate the LayerType-suffix from the rest of the id.'
    )
  }

  const name = layerGroupIdSplitArr.slice(0, -1).join('-')
  if (name.length > 0) {
    return name
  }

  return layerGroupId
}

export const getLayerGroupIdForLayer = (
  layerId: string,
  layerGroups: LayerGroups
): string | null => {
  // Iterate over the layerGroups
  for (const groupId in layerGroups) {
    if (Object.prototype.hasOwnProperty.call(layerGroups, groupId)) {
      const group = layerGroups[groupId]

      // Check if the layerId exists within the layers of the current group
      if (group.layers[layerId]) {
        return groupId // return the layer group ID
      }
    }
  }

  return null // return null if no group is found containing the layerId
}

// A helper function for resolving a style
// that can be either a style object or
// a function returning a style object.
export const resolveMbStyle = async (
  mbStyle: ExtendedStyleSpecificationOrFn
): Promise<ExtendedStyleSpecification> => {
  let style: ExtendedStyleSpecification
  if (typeof mbStyle === 'function') {
    style = await mbStyle()
  } else {
    style = mbStyle
  }

  return style
}

export const getVisibleLayerGroups = (
  layerGroups: Record<string, LayerGroupOptions>
) => {
  return Object.keys(layerGroups)
    .filter((key) => !layerGroups[key].isHidden)
    .reduce((acc: Record<string, LayerGroupOptions>, key) => {
      acc[key] = layerGroups[key]
      return acc
    }, {})
}

export const getAllLayerOptionsObj = (
  layerGroups: Record<string, LayerGroupOptions>
) => {
  const allLayerOptionsObj: LayerOptionsObj = Object.values(layerGroups).reduce(
    (acc, group) => {
      return Object.assign(acc, group.layers)
    },
    {} as LayerOptionsObj
  )

  return allLayerOptionsObj
}

export const findSourceOptsById = (id: string, layerGroups: LayerGroups) => {
  let sourceOptions: SourceOptions | undefined

  for (const layerGroupId in layerGroups) {
    sourceOptions = Object.values(layerGroups[layerGroupId].sources).find(
      (source) => source.id === id
    )

    if (sourceOptions) {
      break
    }
  }

  return sourceOptions
}

const getSourceData = (
  layerGroupId: string,
  _mbMap: Map | null
): GeoJSON.FeatureCollection | null => {
  if (!_mbMap || !layerGroupId) {
    return null
  }

  const originalSource = _mbMap.getSource(layerGroupId) as
    | GeoJSONSource
    | undefined

  if (!originalSource || !('_data' in originalSource)) {
    console.error('Source data is missing or not in the expected format.')
    return null
  }

  return originalSource._data as GeoJSON.FeatureCollection
}

export const addFeatureToDrawSource = (
  feature: GeoJSON.Feature,
  layerGroupId: string,
  _mbMap: Map | null
) => {
  const data = getSourceData(layerGroupId, _mbMap)
  if (!data) {
    return
  }

  const newFeatures = [...clone(data.features), feature]

  // Update the source with the modified features
  const originalSource = _mbMap!.getSource(layerGroupId) as GeoJSONSource
  originalSource.setData({ ...data, features: newFeatures })
  _mbMap?.triggerRepaint()
}

export const updateFeatureInDrawSource = (
  feature: Feature,
  idField: string,
  layerGroupId: string,
  _mbMap: Map | null
) => {
  const data = getSourceData(layerGroupId, _mbMap)
  if (!data) {
    return
  }

  let found = false

  const updatedFeatures = data.features.map((f) => {
    // Check if the current feature in the map is the one that needs to be updated
    if (f.properties && feature.properties) {
      const originalId = f.properties[idField]
      const drawId = feature.properties[idField]

      if (originalId === drawId) {
        found = true
        // Return a new feature object with updated geometry
        return { ...f, geometry: feature.geometry }
      }
    }
    // Return the unmodified feature
    return f
  })

  if (!found) {
    if (feature.properties) {
      console.error(
        `Feature with id ${feature.properties[idField]} not found in the original source`
      )
    } else {
      console.error(
        'Feature properties are null, or the feature was not found in the original source.'
      )
    }
  } else {
    // Update the source with the modified features
    const originalSource = _mbMap!.getSource(layerGroupId) as GeoJSONSource
    originalSource.setData({ ...data, features: updatedFeatures })
    _mbMap?.triggerRepaint()
  }
}

export const deleteFeatureFromDrawSource = (
  feature: Feature,
  idField: string,
  layerGroupId: string,
  _mbMap: Map | null
) => {
  const data = getSourceData(layerGroupId, _mbMap)
  if (!data) {
    return
  }

  const updatedFeatures = data.features.filter((f) => {
    if (f.properties && feature.properties) {
      const originalId = f.properties[idField]
      const drawId = feature.properties[idField]

      return originalId !== drawId
    }
    // If properties are missing, keep the feature (i.e., do not delete it)
    return true
  })

  // Update the source with the modified features
  const originalSource = _mbMap!.getSource(layerGroupId) as GeoJSONSource
  originalSource.setData({ ...data, features: updatedFeatures })
  _mbMap?.triggerRepaint()
}

export const getFeaturesFromSourceById = (
  features: Feature[],
  idField: string,
  layerGroupId: string,
  _mbMap: Map | null
) => {
  const data = getSourceData(layerGroupId, _mbMap)

  if (data) {
    // Find the corresponding original features for the selected ones
    const matchingFeatures = features
      .map((feature: Feature) => {
        const originalFeature = data.features.find(
          (originalFeature: Feature) => {
            if (originalFeature.properties && feature.properties) {
              const originalId = originalFeature.properties[idField]
              const featureId = feature.properties[idField]

              return originalId === featureId
            }
            return false
          }
        )
        return originalFeature
      })
      .filter((f: Feature | undefined) => f != undefined)

    return matchingFeatures as Feature[]
  }

  return [] as Feature[]
}

export const getSourceJson = (id: string, map: Map | null) => {
  try {
    const source = map?.getSource(id) as GeoJSONSource

    if (!source || source.type !== 'geojson') {
      console.error(`Source "${id}" either doesn't exist or isn't GeoJSON.`)
      return null
    }

    let data

    if (source._data) {
      data = source._data
    } else if (source._options?.data) {
      data = source._options.data
    } else {
      console.error(`Source "${id}" has no data.`)
      return null
    }

    if (!data || typeof data !== 'object') {
      console.error(`Source "${id}" does not contain valid JSON data.`)
      return null
    }

    if (data.type !== 'FeatureCollection') {
      console.error(`Source "${id}" data is not a valid FeatureCollection.`)
      return null
    }

    // maplibre hallucinates irrelevant ids when the source data is queried like this.
    // set the id to what is should be.
    // for (const feature of data.features) {
    //   console.log(feature)
    //   if (feature.properties?.id) {
    //     feature.id = feature.properties.id
    //   }
    // }

    return data as FeatureCollection
  } catch (e) {
    console.error(e)
  }
  return null
}

export const fetchFeaturesByIds = ({
  ids,
  source,
  map,
  idField = 'id',
}: {
  ids: (string | number | undefined)[]
  source: SelectionSource
  map: Map | null
  idField?: string
}) => {
  if (!map) {
    console.error('Map object is not available')
    return []
  }

  const features = []

  for (const id of ids) {
    if (id == null) {
      console.warn('[fetchFeaturesByIds]: Skipping null or undefined id')
      continue
    }

    if (source.sourceLayer) {
      const queriedAdditionalFeatures = map?.querySourceFeatures(
        source.source,
        {
          sourceLayer: source.sourceLayer, // REQUIRED for vector tile sources
          filter: ['==', ['get', idField], id], // Assumes 'id' is promoted or is the property name
        }
      )

      // only add the first feature, if there are duplicates
      if (
        queriedAdditionalFeatures &&
        queriedAdditionalFeatures.length > 0 &&
        queriedAdditionalFeatures[0] != null
      ) {
        const queriedFeature =
          queriedAdditionalFeatures[0] as ExtendedMapGeoJSONFeature
        queriedFeature.source = source.source
        queriedFeature.sourceLayer = source.sourceLayer
        queriedFeature.isAdditional = true
        // queriedFeature.layer = { id: sourceLayer }
        features.push(queriedFeature)
      } else {
        features.push({
          source: source.source,
          id: id,
          sourceLayer: source.sourceLayer,
          isPlaceholder: true,
          isAdditional: true,
        } as ExtendedMapGeoJSONFeature)
      }
    } else {
      const queriedAdditionalFeatures = map?.querySourceFeatures(
        source.source,
        {
          // @ts-ignore
          filter: ['==', ['get', idField], id], // Assumes 'id' is promoted or is the property name
        }
      )

      // only add the first feature, if there are duplicates
      if (
        queriedAdditionalFeatures &&
        queriedAdditionalFeatures.length > 0 &&
        queriedAdditionalFeatures[0] != null
      ) {
        const queriedFeature =
          queriedAdditionalFeatures[0] as ExtendedMapGeoJSONFeature
        queriedFeature.source = source.source
        queriedFeature.isAdditional = true
        features.push(queriedFeature)
      } else {
        // TODO: here add stuff to actually fetch the data somewhere.
        // wfs, postgres, whatever. The query function could be added to layerConf.
        // Keep the placeholder until the data is fetched. I guess you need a callback to replace
        // the placeholder with the actual data.

        const sourceType = map?.getSource(source.source)?.type

        if (sourceType != null) {
          if (sourceType === 'geojson') {
            const featureCollection = getSourceJson(source.source, map)

            if (featureCollection) {
              const additionalFeature = featureCollection.features.find((f) => {
                return f.id === id
              })

              if (additionalFeature) {
                const extendedFeature = {
                  ...additionalFeature,
                  source: source.source,
                  isAdditional: true,
                }
                features.push(extendedFeature as ExtendedMapGeoJSONFeature)
                continue
              }
              features.push({
                source: source.source,
                id: id,
                isPlaceholder: true,
                isAdditional: true,
              } as ExtendedMapGeoJSONFeature)
              continue
            }
            features.push({
              source: source.source,
              id: id,
              isPlaceholder: true,
              isAdditional: true,
            } as ExtendedMapGeoJSONFeature)
            continue
          }
        }
        // For now, just handle the geojson source
        features.push({
          source: source.source,
          id: id,
          isPlaceholder: true,
          isAdditional: true,
        } as ExtendedMapGeoJSONFeature)
      }
    }
  }

  return features
}

export const getMaplibreDrawMode = (drawMode: DrawMode): MaplibreDrawMode => {
  switch (drawMode) {
    case 'polygon':
      return 'draw_polygon'
    case 'edit':
      return 'simple_select'
  }
}

// TODO: Add more modes as needed
export const getDrawMode = (maplibreDrawMode: MaplibreDrawMode): DrawMode => {
  switch (maplibreDrawMode) {
    case 'draw_polygon':
      return 'polygon'
    case 'simple_select':
      return 'edit'
    case 'direct_select':
      return 'edit'
    case 'static':
      return 'edit'
    default:
      return 'edit'
  }
}

export const isLayerGroupSelectable = (
  layerGroupId: string,
  layerGroups: LayerGroups
) => {
  const layerGroup = layerGroups[layerGroupId]
  if (layerGroup) {
    return Object.values(layerGroup.layers).some((layer) => layer.selectable)
  }

  return false
}

export const getSelectableLayers = (
  layerGroupId: string,
  layerGroups: LayerGroups
): string[] => {
  const layerGroup = layerGroups[layerGroupId]
  if (layerGroup) {
    const layers = Object.values(layerGroup.layers).filter(
      (value) => value.selectable
    )
    const layerIds = layers.map((layer) => layer.id)

    return layerIds
  }

  console.warn(
    '[getSelectableLayers]: No selectable layers found for layerGroup',
    layerGroupId
  )

  return []
}

export const getSelectableLayersForSource = (
  source: SelectionSource,
  layerGroups: LayerGroups
): string[] => {
  let targetGroup: LayerGroupOptions | null = null

  for (const groupId in layerGroups) {
    if (layerGroups[groupId].sources[source.source]) {
      targetGroup = layerGroups[groupId]
      break
    }
  }

  if (targetGroup) {
    const selectableLayers = Object.values(targetGroup.layers)
      .filter((layer) => {
        if (!layer.selectable) {
          return false
        }

        const sourceMatches = isMatchingSource(
          { source: layer.source, sourceLayer: layer.sourceLayer },
          source
        )

        return sourceMatches
      })
      .map((layer) => layer.id)
    return selectableLayers
  }
  console.warn(
    '[getSelectableLayersForSource]: No selectable layers found for source',
    source
  )

  return []
}

export const getMatchingDrawFeatures = (
  draw: any,
  features: MapGeoJSONFeature[],
  idField: string | undefined
): Feature[] => {
  const drawData = draw.getAll()
  const matchingFeatures = drawData.features.filter((drawFeature: Feature) => {
    return features.some((feature) => {
      if (idField) {
        if (
          feature.properties &&
          feature.properties[idField] != null &&
          drawFeature.properties &&
          drawFeature.properties[idField] != null
        ) {
          return drawFeature.properties[idField] === feature.properties[idField]
        }
        return false
      } else {
        return drawFeature.properties?.id === feature.id
      }
    })
  })

  return matchingFeatures
}

export const isMatchingSource = (
  obj1: { source: string; [key: string]: any },
  obj2: { source: string; [key: string]: any }
) => {
  if (obj1 == null || obj2 == null) {
    console.error(
      'One of the objects given to isMatchingSource is null or undefined.'
    )
    return false
  }

  if (obj1.source == null || obj2.source == null) {
    console.error(
      'One of the objects given to isMatchingSource does not have a source property.'
    )
    return false
  }

  const sourceMatches = obj1.source === obj2.source

  const sourceLayerMatches =
    (obj1.sourceLayer == null && obj2.sourceLayer == null) ||
    obj1.sourceLayer === obj2.sourceLayer

  if (sourceMatches && sourceLayerMatches) {
    return true
  }

  return false
}

export const encodeUrlWithParams = (
  url: string,
  params: Record<string, any>
): string => {
  try {
    const jsonParams = JSON.stringify(params)
    const encodedJsonParams = encodeURIComponent(jsonParams)
    return `${EMBEDDED_PARAMS_URL_PREFIX}${encodedJsonParams}${EMBEDDED_PARAMS_URL_SEPARATOR}${url}`
  } catch (error) {
    console.error('Failed to stringify params for URL encoding:', params, error)
    return url
  }
}

export const decodeUrlAndParams = (
  encodedUrl: string
): {
  url: string
  params: Record<string, any>
} | null => {
  if (
    !encodedUrl ||
    typeof encodedUrl !== 'string' ||
    !encodedUrl.startsWith(EMBEDDED_PARAMS_URL_PREFIX)
  ) {
    return null
  }

  const contentWithoutPrefix = encodedUrl.substring(
    EMBEDDED_PARAMS_URL_PREFIX.length
  )
  const separatorIndex = contentWithoutPrefix.indexOf(
    EMBEDDED_PARAMS_URL_SEPARATOR
  )

  if (separatorIndex === -1) {
    return null
  }

  const encodedJsonParams = contentWithoutPrefix.substring(0, separatorIndex)
  const originalUrl = contentWithoutPrefix.substring(
    separatorIndex + EMBEDDED_PARAMS_URL_SEPARATOR.length
  )

  if (encodedJsonParams === '') {
    return null
  }

  try {
    const jsonParams = decodeURIComponent(encodedJsonParams)
    const params = JSON.parse(jsonParams)
    return { url: originalUrl, params }
  } catch (e) {
    console.error('Failed to decode or parse params from URL:', encodedUrl, e)
    return null
  }
}

interface GetJoinedSelectionSourcesForSourceParams {
  joinedSelectionSourceMap: { source: string; sourceLayer?: string }[][]
  source: string
  sourceLayer?: string
}

export const getJoinedSelectionSourcesForSource = ({
  joinedSelectionSourceMap,
  source,
  sourceLayer,
}: GetJoinedSelectionSourcesForSourceParams): {
  source: string
  sourceLayer?: string
}[] => {
  const allRelatedSources: { source: string; sourceLayer?: string }[] = []
  const targetSelection = { source, sourceLayer }

  for (const joinedArray of joinedSelectionSourceMap) {
    const isTargetPresentInJoinedArray = joinedArray.some((selectionInArray) =>
      isMatchingSource(selectionInArray, targetSelection)
    )

    if (isTargetPresentInJoinedArray) {
      allRelatedSources.push(...joinedArray)
    }
  }

  const allRelatedSourcesWithoutTargetSource = allRelatedSources.filter(
    (ss) => !isMatchingSource(ss, targetSelection)
  )

  return uniqBy(
    allRelatedSourcesWithoutTargetSource,
    (ss) => `${ss.source}#${ss.sourceLayer || 'undefined'}` // Create a unique key for comparison
  )
}

export const getFeatureCenterCoordinates = (
  feature: Feature
): [number, number] | null => {
  if (!feature.geometry) {
    return null
  }
  try {
    const featureCenter = center(feature as AllGeoJSON)
    return featureCenter.geometry.coordinates as [number, number]
  } catch (e) {
    console.error('Could not get feature coordinates', e)
    return null
  }
}

export const defaultFeatureDisplayPattern = (
  feature: any,
  fields: string[]
): string[] => {
  const pieces: string[] = []
  const primaryKeys = ['name', 'title', 'label']
  const addedKeys: Set<string> = new Set()

  const properties = feature.properties || {}

  // Create a mapping from lowercase property keys to their original cased keys
  const lowerCaseKeyMap: Record<string, string> = Object.keys(
    properties
  ).reduce((acc, key) => {
    acc[key.toLowerCase()] = key
    return acc
  }, {} as Record<string, string>)

  // Find primary keys first, case-insensitively
  for (const primaryKey of primaryKeys) {
    const originalKey = lowerCaseKeyMap[primaryKey]
    if (originalKey && properties[originalKey] != null) {
      pieces.push(properties[originalKey])
      addedKeys.add(primaryKey)
    }
  }

  // Add other fields, ensuring they haven't been added
  if (fields && fields.length > 0) {
    for (const field of fields) {
      const lowerField = field.toLowerCase()
      if (!addedKeys.has(lowerField)) {
        const originalKey = lowerCaseKeyMap[lowerField]
        if (originalKey && properties[originalKey] != null) {
          pieces.push(properties[originalKey])
          addedKeys.add(lowerField)
        }
      }
    }
  }

  return pieces
}
