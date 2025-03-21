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
  areaHa?: number
  municipality?: string
  region?: string
  date?: string
  personInCharge?: string
}

export interface LayerConf {
  id: string
  name: string
  colorCode: string
  createdTs: number
  updatedTs: number
  description?: string
}

export enum LayerConfState {
  Idle = 'idle',
  Fetching = 'fetching',
  Saving = 'saving',
  Deleting = 'deleting',
}

export interface AdminLayerConf extends LayerConf {
  isVisible: boolean
  state: LayerConfState
}

export interface LayerAreaCollection {
  id: string
  features: FeatureProperties[]
  state: LayerConfState
}
