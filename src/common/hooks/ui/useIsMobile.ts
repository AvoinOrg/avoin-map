import { useSyncExternalStore } from 'react'

import { DESKTOP_BREAKPOINT_KEY } from '#/common/style/theme/constants'
import { appBreakpoints } from '#/common/style/theme/tokens'

export type AppBreakpoint = keyof typeof appBreakpoints

const getDownQuery = (breakpoint: AppBreakpoint) => {
  const breakpointValue = appBreakpoints[breakpoint]
  const maxWidth = Math.max(0, breakpointValue - 0.05)

  return `(max-width: ${maxWidth}px)`
}

const subscribeToQuery = (
  query: string,
  onStoreChange: () => void
) => {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const mediaQueryList = window.matchMedia(query)
  mediaQueryList.addEventListener('change', onStoreChange)

  return () => {
    mediaQueryList.removeEventListener('change', onStoreChange)
  }
}

const getSnapshot = (query: string) => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(query).matches
}

export const useIsMobile = (
  breakpoint: AppBreakpoint = DESKTOP_BREAKPOINT_KEY
) => {
  const query = getDownQuery(breakpoint)

  return useSyncExternalStore(
    (onStoreChange) => subscribeToQuery(query, onStoreChange),
    () => getSnapshot(query),
    () => false
  )
}
