import { Feature, Geometry } from 'geojson'

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

export interface FolayerAreaCollection {
  id: string
  features: FolayerFeature[]
  state: FolayerConfState
}
