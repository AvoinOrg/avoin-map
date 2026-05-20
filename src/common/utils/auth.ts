import { openWindow } from '#/common/utils/modal'

export const getLoginUrl = (locale?: string | null) => {
  const normalizedLocale = locale?.trim() || 'en'
  return `/${normalizedLocale}/adds/login`
}

export const openLoginWindow = (locale?: string | null) => {
  openWindow(getLoginUrl(locale))
}
