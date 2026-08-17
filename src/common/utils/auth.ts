import {
  createZitadelAuthorizationUrl,
  signInWithZitadel,
} from '#/common/auth/client'
import {
  resolveBrowserMockAuthState,
  resolveMockAuthConfig,
  shouldUseRealAuthForMockState,
} from '#/common/auth/mock'
import { useUIStore } from '#/common/store/uiStore'
import {
  formatAuthPopupFeatures,
  getAuthPopupGeometryFromWindow,
} from '#/common/utils/authPopup'

export const getLoginUrl = (locale?: string | null) => {
  const normalizedLocale = locale?.trim() || 'en'
  return `/${normalizedLocale}/adds/login`
}

export const getLoginCallbackUrl = (locale?: string | null) => {
  const normalizedLocale = locale?.trim() || 'en'
  return `/${normalizedLocale}/adds/login/callback`
}

const shouldUseMockLogin = () => {
  const mockConfig = resolveMockAuthConfig()

  if (!mockConfig.enabled) {
    return false
  }

  return !shouldUseRealAuthForMockState(resolveBrowserMockAuthState(mockConfig))
}

const assignPopupLocation = (popup: Window, url: string) => {
  popup.location.href = url
}

export const openLoginWindow = async (locale?: string | null) => {
  const callbackURL = getLoginCallbackUrl(locale)

  if (shouldUseMockLogin()) {
    await signInWithZitadel()
    return null
  }

  if (typeof window === 'undefined') {
    return null
  }

  const visibleMap = useUIStore.getState().mapDims.visible
  const features = formatAuthPopupFeatures(
    getAuthPopupGeometryFromWindow(window, visibleMap)
  )
  const popup = window.open('about:blank', '_blank', features)

  try {
    const url = await createZitadelAuthorizationUrl({ callbackURL })

    if (popup && !popup.closed) {
      assignPopupLocation(popup, url)
      return popup
    }

    window.location.assign(url)
    return null
  } catch (error) {
    if (popup && !popup.closed) {
      popup.close()
    }

    throw error
  }
}
