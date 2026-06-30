import { DEFAULT_LOCALE } from '#/common/navigation/tolgee/shared'
import {
  getAppletRouteSlugInfo,
  normalizeLegacyAppletSubpathSegments,
} from './publicRoutes'

import appletConf from '../../../appletConf.json'

const MAIN_NAMESPACE = 'main'

type AppletConfig = {
  langs?: string[]
  domains?: string[]
}

type AppletConf = Record<string, AppletConfig>

const conf = appletConf as AppletConf

export const REQUEST_ROUTING_SKIP_PREFIXES = [
  '/_build',
  '/_serverFn',
  '/api',
  '/favicon.ico',
  '/apple-icon',
  '/icon',
  '/robots.txt',
  '/sitemap.xml',
  '/files',
  '/lib',
]

const COMMON_LOCALIZED_PATHS = ['/adds']

export type RequestRoutingDecision =
  | { type: 'passThrough' }
  | {
      type: 'redirect'
      status: 308
      pathname: string
      search: string
    }
  | {
      type: 'rewrite'
      pathname: string
      search: string
    }

export type DecideRequestRoutingOptions = {
  url: string | URL
  host?: string | null
  compiledApplets?: string[]
  env?: Record<string, string | undefined>
  skipPrefixes?: string[]
}

const normalizeCompiledApplets = (compiledApplets?: string[]) => {
  if (compiledApplets) {
    return compiledApplets
      .map((item) => item.toLowerCase().trim())
      .filter(Boolean)
  }

  return (process.env.NEXT_PUBLIC_COMPILED_APPLETS || '')
    .toLowerCase()
    .trim()
    .split(',')
    .filter(Boolean)
}

export const REQUEST_ROUTING_APPLET_NAMESPACES = Object.keys(conf).filter(
  (namespace) => namespace !== MAIN_NAMESPACE
)

const knownApplets = new Set(
  REQUEST_ROUTING_APPLET_NAMESPACES
)

export const getLocalesForRequestNamespace = (namespace: string) =>
  conf[namespace.toLowerCase()]?.langs ?? []

export const getDefaultLocaleForRequestNamespace = (namespace: string) =>
  getLocalesForRequestNamespace(namespace)[0] ?? DEFAULT_LOCALE

const isLocaleLike = (segment: string | undefined): segment is string =>
  segment != null && segment.length === 2

const findAppletInfoFromSegment = (segment: string | undefined) => {
  if (!segment) return null

  const info = getAppletRouteSlugInfo(segment.toLowerCase())
  if (!info || !knownApplets.has(info.namespace)) return null

  return info
}

const parseUrl = (url: string | URL) =>
  url instanceof URL
    ? new URL(url.toString())
    : new URL(url, 'http://localhost')

const withSearch = (
  type: 'redirect' | 'rewrite',
  pathname: string,
  search: string
): RequestRoutingDecision =>
  type === 'redirect'
    ? { type, status: 308, pathname, search }
    : { type, pathname, search }

export const getStandaloneRequestApplet = (compiledApplets?: string[]) => {
  const normalizedCompiledApplets = normalizeCompiledApplets(compiledApplets)

  return normalizedCompiledApplets.length === 1 &&
    normalizedCompiledApplets[0] !== MAIN_NAMESPACE
    ? normalizedCompiledApplets[0]
    : null
}

const getStandaloneApplet = (compiledApplets: string[]) =>
  compiledApplets.length === 1 && compiledApplets[0] !== MAIN_NAMESPACE
    ? compiledApplets[0]
    : null

const hasCommonLocalizedPath = (segments: string[], hasLocale: boolean) =>
  COMMON_LOCALIZED_PATHS.some((path) => {
    const pathWithoutSlash = path.replace(/^\//, '')
    return hasLocale
      ? segments[1] === pathWithoutSlash
      : segments[0] === pathWithoutSlash
  })

const toPathname = (segments: string[]) =>
  segments.length > 0 ? `/${segments.join('/')}` : '/'

const areSegmentsEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((segment, index) => segment === b[index])

const normalizeAppletTailSegments = (namespace: string, segments: string[]) =>
  normalizeLegacyAppletSubpathSegments({ namespace, segments })

const normalizeAppletRootAliasSegments = ({
  namespace,
  segments,
}: {
  namespace: string
  segments: string[]
}) => {
  const [first, second] = segments

  if (namespace === 'hiilikartta') {
    return first === 'kaavat' || first === 'raportti'
      ? normalizeAppletTailSegments(namespace, segments)
      : segments
  }

  if (namespace === 'luonnonmetsakartat') {
    return first === 'admin' && (second === 'tuo' || second === 'taso')
      ? [first, ...normalizeAppletTailSegments(namespace, segments.slice(1))]
      : segments
  }

  return segments
}

const getAppletRootRedirectTailSegments = ({
  namespace,
  segments,
}: {
  namespace: string
  segments: string[]
}) => {
  const firstSegmentInfo = findAppletInfoFromSegment(segments[0])

  if (firstSegmentInfo?.namespace === namespace) {
    return normalizeAppletTailSegments(
      namespace,
      segments.slice(1)
    )
  }

  return normalizeAppletRootAliasSegments({ namespace, segments })
}

const getAppletRootDecision = ({
  namespace,
  pathname,
  search,
  segments,
}: {
  namespace: string
  pathname: string
  search: string
  segments: string[]
}): RequestRoutingDecision => {
  const allowedLocales = new Set(getLocalesForRequestNamespace(namespace))
  const defaultLocale = getDefaultLocaleForRequestNamespace(namespace)

  if (pathname === '/') {
    return withSearch('redirect', `/${defaultLocale}`, search)
  }

  const first = segments[0]
  const locale = isLocaleLike(first) ? first : null

  if (locale == null) {
    return withSearch('redirect', `/${defaultLocale}${pathname}`, search)
  }

  const tailSegments = segments.slice(1)

  if (!allowedLocales.has(locale)) {
    const tail = tailSegments.length > 0 ? `/${tailSegments.join('/')}` : ''
    return withSearch('redirect', `/${defaultLocale}${tail}`, search)
  }

  const firstTailSegment = tailSegments[0]
  const tailAppletInfo = findAppletInfoFromSegment(firstTailSegment)
  const tailApplet = tailAppletInfo?.namespace ?? null

  if (tailApplet === namespace) {
    return withSearch(
      'redirect',
      toPathname([
        locale,
        ...normalizeAppletTailSegments(namespace, tailSegments.slice(1)),
      ]),
      search
    )
  }

  const normalizedRootAliasSegments = normalizeAppletRootAliasSegments({
    namespace,
    segments: tailSegments,
  })

  if (!areSegmentsEqual(tailSegments, normalizedRootAliasSegments)) {
    return withSearch(
      'redirect',
      toPathname([locale, ...normalizedRootAliasSegments]),
      search
    )
  }

  return { type: 'passThrough' }
}

export const decideRequestRouting = ({
  url,
  compiledApplets,
  skipPrefixes = REQUEST_ROUTING_SKIP_PREFIXES,
}: DecideRequestRoutingOptions): RequestRoutingDecision => {
  const requestUrl = parseUrl(url)
  const { pathname, search } = requestUrl

  if (skipPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return { type: 'passThrough' }
  }

  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  const locale = isLocaleLike(first) ? first : null
  const hasLocale = locale != null

  if (hasCommonLocalizedPath(segments, hasLocale)) {
    return { type: 'passThrough' }
  }

  const normalizedCompiledApplets = normalizeCompiledApplets(compiledApplets)
  const standaloneApplet = getStandaloneApplet(normalizedCompiledApplets)

  if (standaloneApplet) {
    const allowedLocales = new Set(
      getLocalesForRequestNamespace(standaloneApplet)
    )
    const defaultLocale =
      getDefaultLocaleForRequestNamespace(standaloneApplet)

    if (locale == null && pathname !== '/') {
      return withSearch(
        'redirect',
        toPathname([
          defaultLocale,
          ...getAppletRootRedirectTailSegments({
            namespace: standaloneApplet,
            segments,
          }),
        ]),
        search
      )
    }

    if (locale != null && !allowedLocales.has(locale)) {
      return withSearch(
        'redirect',
        toPathname([
          defaultLocale,
          ...getAppletRootRedirectTailSegments({
            namespace: standaloneApplet,
            segments: segments.slice(1),
          }),
        ]),
        search
      )
    }

    return getAppletRootDecision({
      namespace: standaloneApplet,
      pathname,
      search,
      segments,
    })
  }

  if (pathname === '/') {
    return withSearch('redirect', `/${DEFAULT_LOCALE}`, search)
  }

  const probe = hasLocale ? segments[1] : segments[0]
  const appletInfo = findAppletInfoFromSegment(probe)

  if (appletInfo) {
    const targetNamespace = appletInfo.namespace
    const localesForNamespace = getLocalesForRequestNamespace(targetNamespace)
    const appletTailSegments = segments.slice(hasLocale ? 2 : 1)
    const normalizedAppletTailSegments = normalizeAppletTailSegments(
      targetNamespace,
      appletTailSegments
    )

    if (locale == null) {
      const defaultLocale = getDefaultLocaleForRequestNamespace(targetNamespace)
      return withSearch(
        'redirect',
        toPathname([
          defaultLocale,
          appletInfo.canonicalSlug,
          ...normalizedAppletTailSegments,
        ]),
        search
      )
    }

    if (!localesForNamespace.includes(locale)) {
      const defaultLocale = getDefaultLocaleForRequestNamespace(targetNamespace)
      return withSearch(
        'redirect',
        toPathname([
          defaultLocale,
          appletInfo.canonicalSlug,
          ...normalizedAppletTailSegments,
        ]),
        search
      )
    }

    if (
      appletInfo.isLegacy ||
      !areSegmentsEqual(appletTailSegments, normalizedAppletTailSegments)
    ) {
      return withSearch(
        'redirect',
        toPathname([
          locale,
          appletInfo.canonicalSlug,
          ...normalizedAppletTailSegments,
        ]),
        search
      )
    }

    return { type: 'passThrough' }
  }

  const mainLocales = getLocalesForRequestNamespace(MAIN_NAMESPACE)

  if (locale != null) {
    if (!mainLocales.includes(locale)) {
      const defaultLocale = getDefaultLocaleForRequestNamespace(MAIN_NAMESPACE)

      if (segments.length > 1) {
        return withSearch(
          'redirect',
          `/${defaultLocale}/${segments.slice(1).join('/')}`,
          search
        )
      }

      return withSearch('redirect', `/${defaultLocale}`, search)
    }

    return { type: 'passThrough' }
  }

  const defaultLocale = getDefaultLocaleForRequestNamespace(MAIN_NAMESPACE)
  return withSearch(
    'redirect',
    `/${defaultLocale}/${segments.join('/')}`,
    search
  )
}

export const getRequestRoutingTargetUrl = (
  requestUrl: string | URL,
  decision: Extract<RequestRoutingDecision, { type: 'redirect' | 'rewrite' }>
) => {
  const targetUrl = parseUrl(requestUrl)
  targetUrl.pathname = decision.pathname
  targetUrl.search = decision.search
  return targetUrl
}
