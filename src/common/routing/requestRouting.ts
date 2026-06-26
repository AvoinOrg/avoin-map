import { DEFAULT_LOCALE } from '#/common/navigation/tolgee/shared'
import {
  getAppletRouteSlugInfo,
  getPublicAppletRouteSlug,
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

const APPLET_DOMAIN_ENV_BY_NAMESPACE: Record<string, string | undefined> = {
  energiakartta:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_APPLET_ENERGIAKARTTA_DOMAIN
      : undefined,
  hiilikartta:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_APPLET_HIILIKARTTA_DOMAIN
      : undefined,
  luonnonmetsakartat:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_APPLET_LUONNONMETSAKARTAT_DOMAIN
      : undefined,
}

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

const normalizeDomainValue = (value: string | undefined | null) => {
  if (!value) return null

  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return null

  try {
    const url = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    )

    return {
      host: url.host.toLowerCase(),
      hostname: url.hostname.toLowerCase(),
    }
  } catch {
    return null
  }
}

const getHostVariants = (host: string | null | undefined, url: URL) => {
  const normalizedHost = normalizeDomainValue(host ?? url.host)
  if (!normalizedHost) return new Set<string>()

  return new Set([normalizedHost.host, normalizedHost.hostname])
}

const getEnvAppletDomain = (
  namespace: string,
  env: Record<string, string | undefined> | undefined
) =>
  env?.[`NEXT_PUBLIC_APPLET_${namespace.toUpperCase()}_DOMAIN`] ??
  APPLET_DOMAIN_ENV_BY_NAMESPACE[namespace]

const getAppletDomains = (
  namespace: string,
  env: Record<string, string | undefined> | undefined
) => {
  const appletDomains = conf[namespace]?.domains ?? []
  const envDomain = getEnvAppletDomain(namespace, env)

  return [...appletDomains, envDomain].filter(
    (domain): domain is string => domain != null && domain.trim() !== ''
  )
}

export const findAppletForRequestHost = (
  host: string | null | undefined,
  url: URL,
  env: Record<string, string | undefined> | undefined
) => {
  const hostVariants = getHostVariants(host, url)
  if (hostVariants.size === 0) return null

  for (const namespace of knownApplets) {
    for (const domain of getAppletDomains(namespace, env)) {
      const normalizedDomain = normalizeDomainValue(domain)
      if (!normalizedDomain) continue

      if (
        hostVariants.has(normalizedDomain.host) ||
        hostVariants.has(normalizedDomain.hostname)
      ) {
        return namespace
      }
    }
  }

  return null
}

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

const getRemovedRootAliasCanonicalSegments = ({
  namespace,
  segments,
}: {
  namespace: string
  segments: string[]
}) => {
  const [first] = segments

  if (namespace === 'hiilikartta' && (first === 'plans' || first === 'kaavat')) {
    return [
      getPublicAppletRouteSlug(namespace),
      ...normalizeAppletTailSegments(namespace, segments),
    ]
  }

  if (namespace === 'luonnonmetsakartat' && first === 'admin') {
    return [
      getPublicAppletRouteSlug(namespace),
      first,
      ...normalizeAppletTailSegments(namespace, segments.slice(1)),
    ]
  }

  return null
}

const hasVisibleRootAliasRoute = ({
  namespace,
  segments,
}: {
  namespace: string
  segments: string[]
}) => {
  const [first] = segments

  if (segments.length === 0) return true
  if (namespace === 'hiilikartta') {
    return first === 'report'
  }

  return false
}

type MainModeRootAlias = {
  namespace: string
  segments: string[]
}

const isRemovedLuonnonmetsakartatAdminRootAlias = (segments: string[]) => {
  const [first, second] = segments

  if (first !== 'admin') return false
  if (segments.length === 1) return true
  if (second === 'import' || second === 'tuo' || second === 'taso') return true

  return second === 'layer' && segments.length >= 3
}

const getMainModeDeletedRootAlias = (
  segments: string[]
): MainModeRootAlias | null => {
  const [first] = segments

  if (first === 'plans' || first === 'kaavat') {
    return {
      namespace: 'hiilikartta',
      segments: normalizeAppletRootAliasSegments({
        namespace: 'hiilikartta',
        segments,
      }),
    }
  }

  if (isRemovedLuonnonmetsakartatAdminRootAlias(segments)) {
    return {
      namespace: 'luonnonmetsakartat',
      segments: normalizeAppletRootAliasSegments({
        namespace: 'luonnonmetsakartat',
        segments,
      }),
    }
  }

  return null
}

const getMainModeLegacyRootAlias = (
  segments: string[]
): MainModeRootAlias | null => {
  const [first, second] = segments

  if (first === 'raportti') {
    return {
      namespace: 'hiilikartta',
      segments: normalizeAppletRootAliasSegments({
        namespace: 'hiilikartta',
        segments,
      }),
    }
  }

  if (first === 'admin' && (second === 'tuo' || second === 'taso')) {
    return {
      namespace: 'luonnonmetsakartat',
      segments: normalizeAppletRootAliasSegments({
        namespace: 'luonnonmetsakartat',
        segments,
      }),
    }
  }

  return null
}

const getMainModeRootAlias = (segments: string[]) =>
  getMainModeDeletedRootAlias(segments) ?? getMainModeLegacyRootAlias(segments)

const getMainModeRootAliasDecision = ({
  locale,
  search,
  segments,
  getAlias,
}: {
  locale: string | null
  search: string
  segments: string[]
  getAlias: (segments: string[]) => MainModeRootAlias | null
}): RequestRoutingDecision | null => {
  const alias = getAlias(locale == null ? segments : segments.slice(1))
  if (!alias) return null

  const namespaceLocales = getLocalesForRequestNamespace(alias.namespace)
  const targetLocale = locale != null && namespaceLocales.includes(locale)
    ? locale
    : getDefaultLocaleForRequestNamespace(alias.namespace)

  return withSearch(
    'redirect',
    toPathname([
      targetLocale,
      getPublicAppletRouteSlug(alias.namespace),
      ...alias.segments,
    ]),
    search
  )
}

const getAppletRootRedirectTailSegments = ({
  namespace,
  segments,
  stripCanonicalNamespace,
}: {
  namespace: string
  segments: string[]
  stripCanonicalNamespace: boolean
}) => {
  const firstSegmentInfo = findAppletInfoFromSegment(segments[0])

  if (firstSegmentInfo?.namespace === namespace) {
    const normalizedTail = normalizeAppletTailSegments(
      namespace,
      segments.slice(1)
    )

    return stripCanonicalNamespace
      ? normalizedTail
      : [firstSegmentInfo.canonicalSlug, ...normalizedTail]
  }

  if (!stripCanonicalNamespace) {
    const canonicalSegments = getRemovedRootAliasCanonicalSegments({
      namespace,
      segments,
    })

    if (canonicalSegments) {
      return canonicalSegments
    }
  }

  return normalizeAppletRootAliasSegments({ namespace, segments })
}

const getAppletRootDecision = ({
  namespace,
  pathname,
  search,
  segments,
  stripCanonicalNamespace,
}: {
  namespace: string
  pathname: string
  search: string
  segments: string[]
  stripCanonicalNamespace: boolean
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
    const appletTailSegments = tailSegments.slice(1)
    const normalizedAppletTailSegments = normalizeAppletTailSegments(
      namespace,
      appletTailSegments
    )

    if (stripCanonicalNamespace) {
      return withSearch(
        'redirect',
        toPathname([locale, ...normalizedAppletTailSegments]),
        search
      )
    }

    if (
      tailAppletInfo?.isLegacy ||
      !areSegmentsEqual(appletTailSegments, normalizedAppletTailSegments)
    ) {
      return withSearch(
        'redirect',
        toPathname([
          locale,
          getPublicAppletRouteSlug(namespace),
          ...normalizedAppletTailSegments,
        ]),
        search
      )
    }

    return { type: 'passThrough' }
  }

  const normalizedRootAliasSegments = normalizeAppletRootAliasSegments({
    namespace,
    segments: tailSegments,
  })

  if (!stripCanonicalNamespace) {
    const canonicalSegments = getRemovedRootAliasCanonicalSegments({
      namespace,
      segments: tailSegments,
    })

    if (canonicalSegments) {
      return withSearch(
        'redirect',
        toPathname([locale, ...canonicalSegments]),
        search
      )
    }
  }

  if (!areSegmentsEqual(tailSegments, normalizedRootAliasSegments)) {
    return withSearch(
      'redirect',
      toPathname([locale, ...normalizedRootAliasSegments]),
      search
    )
  }

  if (hasVisibleRootAliasRoute({ namespace, segments: tailSegments })) {
    return { type: 'passThrough' }
  }

  if (stripCanonicalNamespace) {
    return { type: 'passThrough' }
  }

  return withSearch(
    'rewrite',
    toPathname([
      locale,
      getPublicAppletRouteSlug(namespace),
      ...tailSegments,
    ]),
    search
  )
}

export const decideRequestRouting = ({
  url,
  host,
  compiledApplets,
  env,
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
  const hostApplet = findAppletForRequestHost(host, requestUrl, env)
  const appletRootNamespace = standaloneApplet ?? hostApplet

  if (appletRootNamespace) {
    const allowedLocales = new Set(
      getLocalesForRequestNamespace(appletRootNamespace)
    )
    const defaultLocale =
      getDefaultLocaleForRequestNamespace(appletRootNamespace)

    if (locale == null && pathname !== '/') {
      return withSearch(
        'redirect',
        toPathname([
          defaultLocale,
          ...getAppletRootRedirectTailSegments({
            namespace: appletRootNamespace,
            segments,
            stripCanonicalNamespace: standaloneApplet != null,
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
            namespace: appletRootNamespace,
            segments: segments.slice(1),
            stripCanonicalNamespace: standaloneApplet != null,
          }),
        ]),
        search
      )
    }

    return getAppletRootDecision({
      namespace: appletRootNamespace,
      pathname,
      search,
      segments,
      stripCanonicalNamespace: standaloneApplet != null,
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
    const rootAliasDecision = getMainModeRootAliasDecision({
      locale,
      search,
      segments,
      getAlias: getMainModeRootAlias,
    })

    if (rootAliasDecision) {
      return rootAliasDecision
    }

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

  const removedRootAliasDecision = getMainModeRootAliasDecision({
    locale: null,
    search,
    segments,
    getAlias: getMainModeDeletedRootAlias,
  })

  if (removedRootAliasDecision) {
    return removedRootAliasDecision
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
