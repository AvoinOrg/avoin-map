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
  createdTs: string
  updatedTs: string
  description?: string
}

export enum LayerConfState {
  Idle = 'idle',
  Saving = 'saving',
}

export interface AdminLayerConf extends LayerConf {
  isVisible: boolean
  state: LayerConfState
  features?: FeatureProperties[]
}
