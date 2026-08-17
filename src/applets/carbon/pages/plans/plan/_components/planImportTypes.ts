import { FeatureCollection } from 'geojson'

export type PendingPlanImport = {
  importKey: string
  json: FeatureCollection
  zoningColName: string
  nameColName?: string
}
