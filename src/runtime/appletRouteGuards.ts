import { notFound, redirect } from '@tanstack/react-router'

import {
  findAppletForRequestHost,
  getDefaultLocaleForRequestNamespace,
  getLocalesForRequestNamespace,
  getStandaloneRequestApplet,
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

const getBrowserUrl = () => {
  if (typeof window === 'undefined') return null

  return new URL(window.location.href)
}

const getDomainAppletNamespace = () => {
  const browserUrl = getBrowserUrl()
  if (!browserUrl) return null

  return findAppletForRequestHost(browserUrl.host, browserUrl, undefined)
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

export const getVisibleAppletRootNamespace = () =>
  getStandaloneRequestApplet() ?? getDomainAppletNamespace()

export const isVisibleAppletRootRouteEnabled = (namespace: string) =>
  getVisibleAppletRootNamespace() === namespace

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

export const guardVisibleAppletRootRoute = (
  args: GuardAppletLocaleArgs
) => {
  if (!isVisibleAppletRootRouteEnabled(args.namespace)) {
    throw notFound()
  }

  guardAppletLocale(args)
}

export const guardVisibleAppletRootIndexRoute = ({
  locale,
  location,
}: Omit<GuardAppletLocaleArgs, 'namespace'>) => {
  const namespace = getVisibleAppletRootNamespace()
  if (!namespace) return

  guardAppletLocale({ namespace, locale, location })
}
