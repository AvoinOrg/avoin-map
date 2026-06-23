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
