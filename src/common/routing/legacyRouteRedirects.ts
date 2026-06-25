import { redirect } from '@tanstack/react-router'

type LegacyRedirectLocation = {
  pathname?: string
  searchStr?: string
  hash?: string
}

type LocalizedRouteRedirectArgs = {
  locale: string
  segments?: string[]
  location: LegacyRedirectLocation
}

const getRedirectHash = (location: LegacyRedirectLocation) => {
  if (typeof window !== 'undefined') {
    return window.location.hash
  }

  return location.hash ?? ''
}

export const getLegacyRouteTailSegments = ({
  locale,
  location,
  prefixSegments,
}: {
  locale: string
  location: LegacyRedirectLocation
  prefixSegments: string[]
}) => {
  const pathSegments = (location.pathname ?? '').split('/').filter(Boolean)
  const segmentsWithoutLocale =
    pathSegments[0] === locale ? pathSegments.slice(1) : pathSegments

  const hasPrefix = prefixSegments.every(
    (segment, index) => segmentsWithoutLocale[index] === segment
  )

  return hasPrefix ? segmentsWithoutLocale.slice(prefixSegments.length) : []
}

export const throwLocalizedRouteRedirect = ({
  locale,
  segments = [],
  location,
}: LocalizedRouteRedirectArgs): never => {
  const tail = segments.filter(Boolean).join('/')
  const pathname = tail ? `/${locale}/${tail}` : `/${locale}`

  throw redirect({
    href: `${pathname}${location.searchStr ?? ''}${getRedirectHash(location)}`,
    statusCode: 308,
  })
}
