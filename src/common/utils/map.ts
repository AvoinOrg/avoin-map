import {
  Map,
  ExpressionSpecification,
  GeoJSONSource,
  MapGeoJSONFeature,
  LayerSpecification,
} from 'maplibre-gl'
// import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
// import Layer from 'ol/layer/Layer'
// import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer'
// import { asArray } from 'ol/color'
// import { packColor } from 'ol/renderer/webgl/shaders'
import {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Position,
} from 'geojson'
import { buffer, Feature as TurfFeature, LineString, Polygon } from '@turf/turf'
import { toMercator, toWgs84 } from '@turf/projection'
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
  LayerOrderLevel,
  LayerOptions,
  ExtendedLayerSpecification,
  GeneratedFillPatternOptions,
  ColorStop,
  AutoRelocateOptions,
  ExtendedMaplibreDrawMode,
} from '../types/map'
import { clone, uniqBy } from 'lodash-es'
import { useMapStore } from '../store'
import {
  CANVAS_FILL_DEFAULT_BACKGROUND_COLOR,
  CANVAS_FILL_DEFAULT_COLOR,
  CANVAS_FILL_ZOOM_SIZE_RANGES,
  getCanvasFillPatternOptions,
  MAX_MERC_LAT,
  PLACE_RANK_ZOOM_ANCHORS,
} from '../constants/map'
import { canvasFill } from 'maplibre_symbol_utils'
import { colorAtValue } from './general'

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
      'Invalid layer id: ' +
        layerGroupId +
        '. Only use hyphen ("-") to separate the LayerType-suffix from the rest of the id.'
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

export const findLayerOptsById = (
  id: string,
  layerGroups: Record<string, LayerGroupOptions>
) => {
  for (const layerGroupId in layerGroups) {
    const layerOptions = layerGroups[layerGroupId].layers[id]
    if (layerOptions) {
      return layerOptions
    }
  }

  return undefined
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

export const getMaplibreDrawMode = (
  drawMode: DrawMode
): ExtendedMaplibreDrawMode => {
  switch (drawMode) {
    case 'polygon':
      return 'draw_polygon'
    case 'edit':
      return 'simple_select'
    case 'corridor':
      return 'draw_corridor' as any
  }
}

// TODO: Add more modes as needed
export const getDrawMode = (
  maplibreDrawMode: ExtendedMaplibreDrawMode
): DrawMode => {
  switch (maplibreDrawMode) {
    case 'draw_polygon':
      return 'polygon'
    case 'simple_select':
      return 'edit'
    case 'draw_corridor':
      return 'corridor'
    case 'direct_select':
      return 'edit'
    case 'static':
      return 'edit'
    default:
      return 'edit'
  }
}

// Corridor preview/buffer helpers
export const CORRIDOR_PREVIEW_SOURCE_ID = 'corridor-preview-src'
export const CORRIDOR_PREVIEW_LAYER_ID = 'corridor-preview-layer'

export const ensureCorridorPreviewLayers = (map: Map) => {
  if (!map.getSource(CORRIDOR_PREVIEW_SOURCE_ID)) {
    map.addSource(CORRIDOR_PREVIEW_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    } as any)
  }
  if (!map.getLayer(CORRIDOR_PREVIEW_LAYER_ID)) {
    map.addLayer({
      id: CORRIDOR_PREVIEW_LAYER_ID,
      type: 'fill',
      source: CORRIDOR_PREVIEW_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.25 },
    })
  }
}

export const clearCorridorPreview = (map: maplibregl.Map) => {
  const src = map.getSource(CORRIDOR_PREVIEW_SOURCE_ID) as any
  if (src) {
    console.log("CLEARING CORRIDOR PREVIEW")
    src.setData({ type: 'FeatureCollection', features: [] })
  }
}

export const setCorridorPreviewVisible = (
  map: maplibregl.Map,
  show: boolean
) => {
  if (map.getLayer(CORRIDOR_PREVIEW_LAYER_ID)) {
    map.setLayoutProperty(
      CORRIDOR_PREVIEW_LAYER_ID,
      'visibility',
      show ? 'visible' : 'none'
    )
  }
}

let jstsP: Promise<any> | null = null
export const getJSTS = () =>
  (jstsP ??= (async () => {
    const [GeoJSONReader, GeoJSONWriter, BufferParameters, BufferOp] =
      await Promise.all([
        import('jsts/org/locationtech/jts/io/GeoJSONReader.js').then(
          (m) => m.default
        ),
        import('jsts/org/locationtech/jts/io/GeoJSONWriter.js').then(
          (m) => m.default
        ),
        import(
          'jsts/org/locationtech/jts/operation/buffer/BufferParameters.js'
        ).then((m) => m.default),
        import('jsts/org/locationtech/jts/operation/buffer/BufferOp.js').then(
          (m) => m.default
        ),
      ])
    return {
      io: { GeoJSONReader, GeoJSONWriter },
      operation: { buffer: { BufferParameters, BufferOp } },
    }
  })())
const asGeometry = (g: any) => {
  if (!g) return null
  if (g.type === 'Feature') return g.geometry
  if (g.type === 'FeatureCollection') {
    // you draw one line; take first geometry defensively
    const f = g.features?.[0]
    return f ? f.geometry : null
  }
  return g // already a geometry
}

const asFeature = (geom: any): TurfFeature<Polygon | MultiPolygon> => ({
  type: 'Feature',
  properties: {},
  geometry: geom as Polygon | MultiPolygon,
})

export const corridorPolygonFromLine = async (
  line: TurfFeature<LineString>,
  halfWidthMeters: number
): Promise<TurfFeature<Polygon | MultiPolygon>> => {
  // Prefer JSTS when it’s legal to load; otherwise fall back cleanly.
  try {
    const jsts = await getJSTS()

    // PROJECT → READ GEOMETRY (not Feature!) → BUFFER → WRITE → UNPROJECT
    const merc = toMercator(line) as any
    const geomIn = asGeometry(merc)
    if (!geomIn) throw new Error('GeoJSONReader: no geometry extracted')

    const reader = new jsts.io.GeoJSONReader()
    const writer = new jsts.io.GeoJSONWriter()

    const jGeom = reader.read(geomIn) // JTS Geometry
    if (!jGeom) throw new Error('GeoJSONReader returned undefined')

    const params = new jsts.operation.buffer.BufferParameters()
  params.setEndCapStyle(jsts.operation.buffer.BufferParameters.CAP_FLAT) // flat ends
  params.setJoinStyle(jsts.operation.buffer.BufferParameters.JOIN_MITRE) // sharp bends
  params.setMitreLimit(1) // fall back to beveled corners on very acute angles

    const jBuffered = jsts.operation.buffer.BufferOp.bufferOp(
      jGeom,
      halfWidthMeters,
      params
    )
    const geojsonGeom = writer.write(jBuffered) // Geometry JSON (not Feature)
    const wgsGeom = toWgs84(geojsonGeom) as Polygon | MultiPolygon

    return asFeature(wgsGeom)
  } catch (err) {
    // Loud, but don’t brick drawing
    console.warn(
      '[corridorPolygonFromLine] JSTS failed; falling back to Turf:',
      err
    )
  }

  // Fallback: Turf buffer (rounded ends everywhere)
  const km = halfWidthMeters / 1000
  return buffer(line, km, {
    units: 'kilometers',
    steps: 16,
  }) as TurfFeature<Polygon | MultiPolygon>
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

        if (layer.source == null) {
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

export const getLayersForSource = (
  source: SelectionSource,
  layerGroups: LayerGroups
): LayerOptions[] => {
  let targetGroup: LayerGroupOptions | null = null

  for (const groupId in layerGroups) {
    if (layerGroups[groupId].sources[source.source]) {
      targetGroup = layerGroups[groupId]
      break
    }
  }

  if (targetGroup) {
    const layers = Object.values(targetGroup.layers).filter((layer) => {
      if (layer.source == null) {
        return false
      }

      const sourceMatches = isMatchingSource(
        { source: layer.source, sourceLayer: layer.sourceLayer },
        source
      )

      return sourceMatches
    })

    return layers
  }
  console.warn('[getLayersForSource]: No layers found for source', source)

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

  const sourceLayer1 = obj1.sourceLayer ?? obj1['source-layer']
  const sourceLayer2 = obj2.sourceLayer ?? obj2['source-layer']

  const sourceLayerMatches =
    (sourceLayer1 == null && sourceLayer2 == null) ||
    sourceLayer1 === sourceLayer2

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

// Finds the first layer that starts with the given id. Maplibre renders
// layers in order, last layer in array being on top.
export const findFirstMatchingLayer = (id: string, map: Map | null) => {
  if (map) {
    const layers = map.getStyle().layers

    if (layers) {
      let firstMatch = layers.find((l) => l.id.startsWith(id))
      return firstMatch ? firstMatch.id : null
    }
  }

  return null
}

// Finds the last layer that starts with the given id
export const findLastMatchingLayer = (id: string, map: Map | null) => {
  if (map) {
    const layers = map.getStyle().layers

    if (layers) {
      let lastMatch: string | null = null
      layers.forEach((layer) => {
        if (layer.id.startsWith(id)) {
          lastMatch = layer.id
        }
      })

      return lastMatch
    }
  }

  return null
}

// The default mapbox addLayer function can only specify a
// layer to be added before another layer.
export const addLayerAfter = (
  layer: LayerSpecification,
  afterId: string,
  map: Map | null
) => {
  const layers = map?.getStyle().layers

  if (layers) {
    const index = layers.findIndex((l) => l.id === afterId)

    if (index !== -1 && index < layers.length - 1) {
      // Get the ID of the layer after the 'after' layer
      const beforeId = layers[index + 1].id

      // Add the new layer before that layer, effectively adding it after the 'after' layer
      map?.addLayer(layer, beforeId)
    } else {
      // If the 'after' layer wasn't found or it's the last layer, just add the new layer
      map?.addLayer(layer)
    }
  }
}

export const addLayerByOrderLevel = ({
  layer,
  orderLevel,
  map,
  isAddedUnder = false, // Default to adding above the topmost layer
}: {
  layer: LayerSpecification
  orderLevel: LayerOrderLevel
  map: Map | null
  isAddedUnder?: boolean // Optional parameter to add below the topmost layer instead of above
}) => {
  if (!map) {
    return
  }

  const layerOrder = Object.values(LayerOrderLevel)

  const mapLayers = map.getStyle().layers
  if (!mapLayers) {
    map.addLayer(layer)
    return
  }

  const layerGroups = useMapStore.getState()._layerGroups
  const findLayersInGroup = (level: LayerOrderLevel) => {
    const groups = Object.values(layerGroups).filter(
      (group) => group.orderLevel === level
    )
    const layerIds = new Set<string>()
    for (const group of groups) {
      for (const layerId in group.layers) {
        layerIds.add(layerId)
      }
    }
    return layerIds
  }

  const targetLayerIds = findLayersInGroup(orderLevel)

  if (targetLayerIds.size > 0) {
    if (!isAddedUnder) {
      let topMostLayerId: string | null = null
      for (let i = mapLayers.length - 1; i >= 0; i--) {
        if (targetLayerIds.has(mapLayers[i].id)) {
          topMostLayerId = mapLayers[i].id
          break
        }
      }
      addLayerAfter(layer, topMostLayerId!, map)
    } else {
      let bottomMostLayerId: string | null = null
      for (let i = 0; i < mapLayers.length; i++) {
        if (targetLayerIds.has(mapLayers[i].id)) {
          bottomMostLayerId = mapLayers[i].id
          break
        }
      }
      map.addLayer(layer, bottomMostLayerId!)
    }
    return
  }

  // If no layers in the target orderLevel, find where to place it.
  const currentOrderIndex = layerOrder.indexOf(orderLevel)

  if (!isAddedUnder) {
    // Find topmost layer of the group below
    for (let i = currentOrderIndex - 1; i >= 0; i--) {
      const belowOrderLevel = layerOrder[i]
      const belowLayerIds = findLayersInGroup(belowOrderLevel)
      if (belowLayerIds.size > 0) {
        let topMostLayerId: string | null = null
        for (let j = mapLayers.length - 1; j >= 0; j--) {
          if (belowLayerIds.has(mapLayers[j].id)) {
            topMostLayerId = mapLayers[j].id
            break
          }
        }
        if (topMostLayerId) {
          addLayerAfter(layer, topMostLayerId, map)
          return
        }
      }
    }

    // Fallback: add to the bottom of the stack
    if (mapLayers.length > 0) {
      map.addLayer(layer, mapLayers[0].id)
    } else {
      map.addLayer(layer)
    }
    return
  } else {
    // isAddedUnder is true
    // Find bottommost layer of the group above
    for (let i = currentOrderIndex + 1; i < layerOrder.length; i++) {
      const aboveOrderLevel = layerOrder[i]
      const aboveLayerIds = findLayersInGroup(aboveOrderLevel)
      if (aboveLayerIds.size > 0) {
        let bottomMostLayerId: string | null = null
        for (let j = 0; j < mapLayers.length; j++) {
          if (aboveLayerIds.has(mapLayers[j].id)) {
            bottomMostLayerId = mapLayers[j].id
            break
          }
        }
        if (bottomMostLayerId) {
          map.addLayer(layer, bottomMostLayerId)
          return
        }
      }
    }

    // Fallback: add to top
    map.addLayer(layer)
    return
  }
}

// TODO: If we ever need deck-gl, we can update to use the fill pattern from there.
export const applyCanvasFillPattern = (
  map: Map | null | undefined,
  layer: ExtendedLayerSpecification,
  generatedFillPatternOptions: GeneratedFillPatternOptions
) => {
  if (!map || layer.type !== 'fill') {
    return layer
  }

  const layerMinZoom = layer.minzoom ?? 0
  const layerMaxZoom = layer.maxzoom ?? Infinity

  const overlappingRanges = CANVAS_FILL_ZOOM_SIZE_RANGES.filter((range) => {
    const rangeMax = range.maxZoom ?? Infinity
    return rangeMax >= layerMinZoom && range.minZoom <= layerMaxZoom
  })

  const ranges: typeof CANVAS_FILL_ZOOM_SIZE_RANGES = overlappingRanges.length
    ? [...overlappingRanges]
    : [CANVAS_FILL_ZOOM_SIZE_RANGES[CANVAS_FILL_ZOOM_SIZE_RANGES.length - 1]]

  if (ranges.length === 1) {
    const loneIndex = CANVAS_FILL_ZOOM_SIZE_RANGES.findIndex(
      (candidate) => candidate.size === ranges[0].size
    )
    const previous = CANVAS_FILL_ZOOM_SIZE_RANGES[loneIndex - 1]
    const next = CANVAS_FILL_ZOOM_SIZE_RANGES[loneIndex + 1]
    if (previous) {
      ranges.unshift(previous)
    } else if (next) {
      ranges.push(next)
    }
  }

  const getImageId = (
    patternId: string,
    size: number,
    color: string,
    backgroundColor: string
  ) => {
    return `${patternId}-${size}-${color}-${backgroundColor}`
  }

  ranges.forEach((range) => {
    const imageId = getImageId(
      generatedFillPatternOptions.patternId,
      range.size,
      generatedFillPatternOptions.colorRGBA || CANVAS_FILL_DEFAULT_COLOR,
      generatedFillPatternOptions.backgroundColorRGBA ||
        CANVAS_FILL_DEFAULT_BACKGROUND_COLOR
    )
    if (map.hasImage(imageId)) {
      return
    }
    const options = getCanvasFillPatternOptions(
      generatedFillPatternOptions.patternId,
      range.size,
      generatedFillPatternOptions.colorRGBA,
      generatedFillPatternOptions.backgroundColorRGBA
    )
    if (!options) {
      return
    }

    map.addImage(imageId, new canvasFill({ ...options }))
  })

  const basePatternId = getImageId(
    generatedFillPatternOptions.patternId,
    ranges[0].size,
    generatedFillPatternOptions.colorRGBA || CANVAS_FILL_DEFAULT_COLOR,
    generatedFillPatternOptions.backgroundColorRGBA ||
      CANVAS_FILL_DEFAULT_BACKGROUND_COLOR
  )

  const fillPatternExpression = [
    'step',
    ['zoom'],
    basePatternId,
    ...ranges
      .slice(1)
      .flatMap((range) => [
        range.minZoom,
        getImageId(
          generatedFillPatternOptions.patternId,
          range.size,
          generatedFillPatternOptions.colorRGBA || CANVAS_FILL_DEFAULT_COLOR,
          generatedFillPatternOptions.backgroundColorRGBA ||
            CANVAS_FILL_DEFAULT_BACKGROUND_COLOR
        ),
      ]),
  ] as unknown as ExpressionSpecification

  const fillPatternValue: string | ExpressionSpecification =
    ranges.length > 1 ? fillPatternExpression : basePatternId

  layer.paint = layer.paint ?? {}
  layer.paint['fill-pattern'] = fillPatternValue
}

/**
 * Build a MapLibre 'step' expression with N bins across [min, max].
 * Each bin gets a color sampled from the piecewise-linear ramp defined by 'stops'.
 */
export const buildBinnedColorExpr = (
  valueExpr: ExpressionSpecification,
  stops: ColorStop[],
  numberOfBins: number
): ExpressionSpecification => {
  if (!Array.isArray(stops) || stops.length < 2) {
    throw new Error('Provide at least two stops: [{color, value}, ...].')
  }
  if (numberOfBins < stops.length) {
    throw new Error('numberOfBins must be >= stops.length')
  }

  // Ensure ascending by value
  const sorted = [...stops].sort((a, b) => a.value - b.value)
  const min = sorted[0].value
  const max = sorted[sorted.length - 1].value

  if (max === min) {
    const onlyColor = colorAtValue(sorted, min)
    return ['step', ['to-number', valueExpr], onlyColor]
  }

  const range = max - min

  // Uniform bin edges across [min, max]
  const edges: number[] = []
  for (let i = 1; i < numberOfBins; i++) {
    edges.push(min + (range * i) / numberOfBins)
  }

  // Bin colors sampled at bin midpoints
  const colors: string[] = []
  for (let i = 0; i < numberOfBins; i++) {
    const vMid = min + (range * (i + 0.5)) / numberOfBins
    colors.push(colorAtValue(sorted, vMid))
  }

  // Build 'step' expression:
  // ['step', valueExpr, colors[0], edges[0], colors[1], edges[1], colors[2], ...]
  const expr: any[] = ['step', ['to-number', valueExpr], colors[0]]
  for (let i = 0; i < edges.length; i++) {
    expr.push(edges[i], colors[i + 1])
  }
  return expr as ExpressionSpecification
}

export const paddingFromVisibleViewport = (
  container: HTMLElement,
  vis: { width: number; height: number; centerX: number; centerY: number }
) => {
  const rect = container.getBoundingClientRect()

  const vLeft = vis.centerX - vis.width / 2
  const vRight = vis.centerX + vis.width / 2
  const vTop = vis.centerY - vis.height / 2
  const vBottom = vis.centerY + vis.height / 2

  // If visible area vertically covers the container, don’t pad vertically.
  const coversVertically = vTop <= rect.top && vBottom >= rect.bottom

  const left = Math.max(0, Math.round(vLeft - rect.left))
  const right = Math.max(0, Math.round(rect.right - vRight))
  const top = coversVertically ? 0 : Math.max(0, Math.round(vTop - rect.top))
  const bottom = coversVertically
    ? 0
    : Math.max(0, Math.round(rect.bottom - vBottom))

  return { left, top, right, bottom } as const
}

const mercY = (latDeg: number) => {
  const φ = (latDeg * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + φ / 2))
}

const invMercY = (y: number) => {
  const φ = 2 * Math.atan(Math.exp(y)) - Math.PI / 2
  return (φ * 180) / Math.PI
}

const clampLat = (lat: number) => {
  return Math.max(-MAX_MERC_LAT, Math.min(MAX_MERC_LAT, lat))
}

export const expandBoundsMercY = (
  lonMin: number,
  lonMax: number,
  latMin: number,
  latMax: number,
  lonExtra: number,
  latExtra: number
): [[number, number], [number, number]] => {
  // Lon: linear → simple
  const lonDiff = lonMax - lonMin
  const west = lonMin - lonExtra * lonDiff
  const east = lonMax + lonExtra * lonDiff

  // Lat: expand in Mercator-Y to keep vertical centering stable
  if (latExtra !== 0) {
    const yMin = mercY(latMin)
    const yMax = mercY(latMax)
    const yDiff = yMax - yMin
    const yMinE = yMin - latExtra * yDiff
    const yMaxE = yMax + latExtra * yDiff
    const south = clampLat(invMercY(yMinE))
    const north = clampLat(invMercY(yMaxE))
    return [
      [west, south],
      [east, north],
    ]
  } else {
    return [
      [west, latMin],
      [east, latMax],
    ]
  }
}

export const boundsFromNominatim = (
  opt: any
): [number, number, number, number] | null => {
  const bb = opt?.boundingbox // ["south","north","west","east"] as strings
  if (!bb || bb.length !== 4) return null
  const south = parseFloat(bb[0]),
    north = parseFloat(bb[1])
  const west = parseFloat(bb[2]),
    east = parseFloat(bb[3])
  if ([south, north, west, east].some(Number.isNaN)) return null
  return [west, south, east, north]
}

// fallback if neither bbox nor place_rank
export const defaultPointZoom = (opt: any): number => {
  // Nominatim has "importance" [0..1]; use it if present
  const imp = typeof opt?.importance === 'number' ? opt.importance : null
  if (imp != null) return 10 + 7 * Math.min(1, Math.max(0, imp)) // ~10..17
  return 13 // safe general default for points
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

export function zoomFromPlaceOptions(
  rank?: number,
  opts?: { importance?: number; cls?: string; type?: string; round?: number }
): number {
  const { importance, cls, type, round = 2 } = opts ?? {}

  if (rank == null || !isFinite(rank as number)) return 12
  const r = clamp(rank, 0, 30)

  // Piecewise-linear interpolation across anchors
  let z: number
  if (r <= PLACE_RANK_ZOOM_ANCHORS[0][0]) {
    z = PLACE_RANK_ZOOM_ANCHORS[0][1]
  } else if (r >= PLACE_RANK_ZOOM_ANCHORS.at(-1)![0]) {
    z = PLACE_RANK_ZOOM_ANCHORS.at(-1)![1]
  } else {
    for (let i = 0; i < PLACE_RANK_ZOOM_ANCHORS.length - 1; i++) {
      const [r0, z0] = PLACE_RANK_ZOOM_ANCHORS[i]
      const [r1, z1] = PLACE_RANK_ZOOM_ANCHORS[i + 1]
      if (r >= r0 && r <= r1) {
        const t = (r - r0) / (r1 - r0)
        z = z0 + t * (z1 - z0)
        break
      }
    }
    // TypeScript appeasement
    z ??= 12
  }

  // Light, optional nudges (feel free to tweak)
  if (typeof importance === 'number') {
    z += (importance - 0.5) * 1.2 // about -0.6..+0.6
  }
  if (cls === 'amenity' || cls === 'shop' || cls === 'tourism') z += 0.4
  if (cls === 'building') z += 0.6
  if (cls === 'highway') z -= 0.3
  if (cls === 'boundary' && (type === 'administrative' || type === 'country'))
    z -= 0.5
  if (cls === 'natural' && (type === 'peak' || type === 'volcano')) z += 0.2

  return +z.toFixed(round)
}

/**
 * Helper function to handle auto-relocate logic for map movement functions.
 * @param autoRelocateOptions Options to check/disable auto-relocate
 * @param isAutoRelocateDisabled Current state from the store
 * @param setIsAutoRelocateDisabled Function to update the store state
 * @returns true if the operation should proceed, false if it should be skipped
 */
export const handleAutoRelocate = (
  autoRelocateOptions: AutoRelocateOptions | undefined
): boolean => {
  const { checkIfAutoRelocate = false, disableAutoRelocate = false } =
    autoRelocateOptions ?? {}

  if (!disableAutoRelocate && !checkIfAutoRelocate) {
    return true // No auto-relocate options, proceed normally
  }

  const isAutoRelocateDisabled = useMapStore.getState().isAutoRelocateDisabled
  const setIsAutoRelocateDisabled =
    useMapStore.getState().setIsAutoRelocateDisabled

  // If disableAutoRelocate is true, set the flag
  if (disableAutoRelocate && !isAutoRelocateDisabled) {
    setIsAutoRelocateDisabled(true)
  }

  // If checkIfAutoRelocate is true and relocate is disabled, skip the operation
  if (checkIfAutoRelocate && isAutoRelocateDisabled) {
    return false
  }

  return true
}
