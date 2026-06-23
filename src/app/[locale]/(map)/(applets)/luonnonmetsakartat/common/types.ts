import type { Feature, FeatureCollection, Geometry } from 'geojson'

export enum AdminVerificationStatus {
  Pending = 'pending',
  Verified = 'verified',
  Rejected = 'rejected',
  NoUser = 'noUser',
  Errored = 'errored',
}

export interface FeatureProperties {
  id: string
  name: string
  owner?: string
  area_ha?: number
  municipality?: string
  region?: string
  date?: string
  person_responsible?: string
  updated_ts?: number
  created_ts?: number
  layer_id?: string
}

export interface FolayerConf {
  id: string
  name: string
  colorCode: string
  createdTs: number
  updatedTs: number
  description?: string
  colOptions?: ColOptions
}

export enum FolayerConfState {
  Idle = 'idle',
  Fetching = 'fetching',
  Saving = 'saving',
  Deleting = 'deleting',
}

export interface AdminFolayerConf extends FolayerConf {
  isVisible: boolean
  state: FolayerConfState
  unsyncedChanges: boolean
}

export type IndexingStrategy = 'name_municipality' | 'id'

export interface ColOptions {
  indexingStrategy: IndexingStrategy
  idCol?: string
  nameCol: string
  municipalityCol: string
  regionCol?: string
  descriptionCol?: string
  areaCol?: string
}

export type FolayerFeatureProperties = FeatureProperties & {
  id: string
  name: string
  created_ts: string
  updated_ts: string
  area_ha: number
  date: string
  region?: string
  municipality?: string
  description?: string
  pictures?: string
}

export type FolayerFeature = Feature<Geometry, FolayerFeatureProperties>

export type PartialFolayerFeature = Partial<
  Feature<Geometry, Partial<FolayerFeatureProperties>>
>

export interface FolayerAreaCollection
  extends FeatureCollection<Geometry, FolayerFeatureProperties> {
  features: FolayerFeature[]
}

export interface FolayerAreaConf {
  id: string
  state: FolayerConfState
  data: FolayerAreaCollection
}
