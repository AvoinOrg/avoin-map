declare module '*.png' {
  const image: {
    src: string
    width: number
    height: number
    blurDataURL?: string
  }

  export default image
}

declare module '@turf/bbox' {
  const bbox: (geojson: unknown) => [number, number, number, number]
  export default bbox
}

declare module '@turf/area' {
  import type { GeoJSON } from 'geojson'

  const area: (geojson: GeoJSON) => number
  export default area
}

declare module '@turf/bbox-polygon' {
  import type { Feature, Polygon } from 'geojson'

  const bboxPolygon: (bbox: [number, number, number, number]) => Feature<Polygon>
  export default bboxPolygon
}

declare module '@turf/boolean-valid' {
  import type { GeoJSON } from 'geojson'

  const booleanValid: (geojson: GeoJSON) => boolean
  export default booleanValid
}

declare module '@turf/helpers' {
  import type { Feature, FeatureCollection } from 'geojson'

  export const featureCollection: (features: Feature[]) => FeatureCollection
}

declare module '@turf/projection' {
  export const toMercator: <TGeoJson>(geojson: TGeoJson) => TGeoJson
  export const toWgs84: <TGeoJson>(geojson: TGeoJson) => TGeoJson
}

declare module '@turf/turf' {
  import type {
    Feature as GeoJsonFeature,
    GeoJSON,
    GeoJsonProperties,
    Geometry,
    LineString as GeoJsonLineString,
    MultiPolygon,
    Point,
    Polygon as GeoJsonPolygon,
  } from 'geojson'

  export const buffer: (
    feature: GeoJsonFeature,
    radius: number,
    options?: Record<string, unknown>
  ) => GeoJsonFeature<GeoJsonPolygon | MultiPolygon>
  export const area: (geojson: GeoJSON) => number
  export const center: (geojson: GeoJSON) => GeoJsonFeature<Point>
  export type AllGeoJSON = GeoJSON
  export type Feature<
    TGeometry extends Geometry | null = Geometry,
    TProperties = GeoJsonProperties,
  > = GeoJsonFeature<TGeometry, TProperties>
  export type LineString = GeoJsonLineString
  export type Polygon = GeoJsonPolygon
}

declare module 'terra-draw/dist/extend' {
  export type FeatureId = string | number
}

declare namespace mapboxgl {
  type LngLatLike = import('maplibre-gl').LngLatLike
}
