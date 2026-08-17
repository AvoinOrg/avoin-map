import { redirect } from '@tanstack/react-router'

import {
  getDefaultLocaleForRequestNamespace,
  getLocalesForRequestNamespace,
} from '#/common/routing/requestRouting'

type AppletRouteLocation = {
  pathname: string
  searchStr: string
  hash: string
}

type GuardAppletLocaleArgs = {
  namespace: string
  locale: string
  location: AppletRouteLocation
}

const getLocaleRedirectHref = ({
  targetLocale,
  location,
}: {
  targetLocale: string
  location: AppletRouteLocation
}) => {
  const segments = location.pathname.split('/').filter(Boolean)
  segments[0] = targetLocale

  return `/${segments.join('/')}${location.searchStr}${location.hash}`
}

export const guardAppletLocale = ({
  namespace,
  locale,
  location,
}: GuardAppletLocaleArgs) => {
  const allowedLocales = getLocalesForRequestNamespace(namespace)

  if (allowedLocales.includes(locale)) return

  throw redirect({
    href: getLocaleRedirectHref({
      targetLocale: getDefaultLocaleForRequestNamespace(namespace),
      location,
    }),
    statusCode: 308,
  })
}
