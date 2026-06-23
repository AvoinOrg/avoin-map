import { DEFAULT_LOCALE } from '#/common/navigation/tolgee/shared'

import appletConf from '../../../appletConf.json'

const MAIN_NAMESPACE = 'main'

type AppletConfig = {
  langs?: string[]
  domains?: string[]
}

type AppletConf = Record<string, AppletConfig>

const conf = appletConf as AppletConf

export const REQUEST_ROUTING_SKIP_PREFIXES = [
  '/_next',
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

const APPLET_PATH_ALIASES: Record<string, string> = {
  energymap: 'energiakartta',
}

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
  | { type: 'next' }
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

const findAppletFromSegment = (segment: string | undefined) => {
  if (!segment) return null

  const normalized = segment.toLowerCase()

  if (knownApplets.has(normalized)) return normalized

  return APPLET_PATH_ALIASES[normalized] ?? null
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
  const tailApplet = findAppletFromSegment(firstTailSegment)

  if (tailApplet === namespace) {
    if (firstTailSegment !== namespace) {
      const tail =
        tailSegments.length > 1 ? `/${tailSegments.slice(1).join('/')}` : ''
      return withSearch('rewrite', `/${locale}/${namespace}${tail}`, search)
    }

    if (stripCanonicalNamespace) {
      const tail =
        tailSegments.length > 1 ? `/${tailSegments.slice(1).join('/')}` : ''
      return withSearch('redirect', `/${locale}${tail}`, search)
    }

    return { type: 'next' }
  }

  const tail = tailSegments.length > 0 ? `/${tailSegments.join('/')}` : ''
  return withSearch('rewrite', `/${locale}/${namespace}${tail}`, search)
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
    return { type: 'next' }
  }

  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  const locale = isLocaleLike(first) ? first : null
  const hasLocale = locale != null

  if (hasCommonLocalizedPath(segments, hasLocale)) {
    return { type: 'next' }
  }

  const normalizedCompiledApplets = normalizeCompiledApplets(compiledApplets)
  const standaloneApplet = getStandaloneApplet(normalizedCompiledApplets)
  const hostApplet = findAppletForRequestHost(host, requestUrl, env)
  const appletRootNamespace = standaloneApplet ?? hostApplet

  if (appletRootNamespace) {
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
  const targetNamespace = findAppletFromSegment(probe)
  const isAppletAlias =
    probe != null && targetNamespace != null && probe !== targetNamespace

  if (targetNamespace) {
    const localesForNamespace = getLocalesForRequestNamespace(targetNamespace)

    if (locale == null) {
      const defaultLocale = getDefaultLocaleForRequestNamespace(targetNamespace)
      return withSearch('redirect', `/${defaultLocale}${pathname}`, search)
    }

    if (!localesForNamespace.includes(locale)) {
      const defaultLocale = getDefaultLocaleForRequestNamespace(targetNamespace)
      const tail = segments.slice(1).join('/')
      return withSearch('redirect', `/${defaultLocale}/${tail}`, search)
    }

    if (isAppletAlias) {
      const tail = segments.length > 2 ? `/${segments.slice(2).join('/')}` : ''
      return withSearch(
        'rewrite',
        `/${locale}/${targetNamespace}${tail}`,
        search
      )
    }

    return { type: 'next' }
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

    return { type: 'next' }
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
