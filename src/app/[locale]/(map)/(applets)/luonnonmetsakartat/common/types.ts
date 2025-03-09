export enum AdminVerificationStatus {
  Pending = 'pending',
  Verified = 'verified',
  Rejected = 'rejected',
  NoUser = 'noUser',
  Errored = 'errored',
}

export interface FeatureProperties {
  id: string
  name: string | number
  area_ha: number
  zoning_code: string | null
  old_zoning_code?: string
  old_id?: string | number
}
