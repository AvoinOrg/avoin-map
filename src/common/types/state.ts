export type VerificationStatus =
  | 'unverified'
  | 'errored'
  | 'verified'
  | 'emailErrored'
  | 'emailSent'

export type ProfileState =
  | 'none'
  | 'data'
  | 'dataIntegrate'
  | 'verification'
  | 'farmCarbon'

export type ModalState = 'none' | 'signup' | 'login' | 'profile'

export type RouteState =
  | 'none'
  | 'allowed'
  | 'verify'
  | 'fetching'
  | 'denied'
  | 'login'

export type NotificationMessage = {
  message: string
  variant: 'default' | 'success' | 'error' | 'info' | 'warning'
  duration?: number
  manualDismiss?: boolean
}

export interface InternalNotificationMessage extends NotificationMessage {
  id: string
  triggeredTs: number
  shown: boolean
}

export type ConfirmationDialogOptions = {
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export interface InternalConfirmationDialogOptions
  extends ConfirmationDialogOptions {
  id: string | null
}

export interface UserAuth {
  id: string
  accessToken: string | undefined
}

export enum UserAuthState {
  Loading = 'loading',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
  Error = 'error',
}

export enum UserDataState {
  Unfetched = 'unfetched',
  Fetching = 'fetching',
  Fetched = 'fetched',
  Error = 'error',
}

export type MapMenuState =
  | 'search'
  | 'backgroundLayers'
  | 'backgroundOverlayLayers'
