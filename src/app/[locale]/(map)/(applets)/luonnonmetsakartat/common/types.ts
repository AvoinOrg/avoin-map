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

export interface FolayerAreaCollection {
  id: string
  features: FeatureProperties[]
  state: FolayerConfState
}
