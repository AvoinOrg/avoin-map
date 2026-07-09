import type { AppletNamespace } from './routeMetadata'

// ui-baseline is a development/QA-only applet and must not get a public slug.
export type PublicAppletNamespace = Exclude<
  AppletNamespace,
  'main' | 'ui-baseline'
>

export const PUBLIC_APPLET_NAMESPACES = [
  'energiakartta',
  'carbon',
  'luonnonmetsakartat',
] as const satisfies readonly PublicAppletNamespace[]

export const APPLET_PUBLIC_ROUTE_SLUGS = {
  energiakartta: 'energy',
  carbon: 'carbon',
  luonnonmetsakartat: 'luonnonmetsakartat',
} as const satisfies Record<PublicAppletNamespace, string>

export const APPLET_LEGACY_PUBLIC_ROUTE_SLUGS = {
  energiakartta: [],
  carbon: [],
  luonnonmetsakartat: [],
} as const satisfies Record<PublicAppletNamespace, readonly string[]>

export const APPLET_LEGACY_SUBPATH_REDIRECTS = {
  energiakartta: {},
  carbon: {
    kaavat: 'plans',
    alueet: 'areas',
    raportti: 'report',
  },
  luonnonmetsakartat: {
    tuo: 'import',
    taso: 'layer',
    asetukset: 'settings',
    kuvat: 'pictures',
  },
} as const satisfies Record<PublicAppletNamespace, Record<string, string>>

export const CARBON_CANONICAL_PUBLIC_SLUG =
  APPLET_PUBLIC_ROUTE_SLUGS.carbon

export type AppletRouteSlugInfo = {
  namespace: PublicAppletNamespace
  canonicalSlug: string
  isLegacy: boolean
}

const CANONICAL_SLUG_TO_NAMESPACE = Object.fromEntries(
  PUBLIC_APPLET_NAMESPACES.map((namespace) => [
    APPLET_PUBLIC_ROUTE_SLUGS[namespace],
    namespace,
  ])
) as Record<string, PublicAppletNamespace>

const LEGACY_SLUG_TO_NAMESPACE = Object.fromEntries(
  PUBLIC_APPLET_NAMESPACES.flatMap((namespace) =>
    APPLET_LEGACY_PUBLIC_ROUTE_SLUGS[namespace].map((slug) => [
      slug,
      namespace,
    ])
  )
) as Record<string, PublicAppletNamespace>

export const getPublicAppletRouteSlug = (namespace: string): string =>
  APPLET_PUBLIC_ROUTE_SLUGS[namespace as PublicAppletNamespace] ?? namespace

export const getAppletNamespaceForPublicRouteSlug = (
  slug: string | undefined
): PublicAppletNamespace | null => {
  if (!slug) return null

  return CANONICAL_SLUG_TO_NAMESPACE[slug.toLowerCase()] ?? null
}

export const getAppletNamespaceForLegacyRouteSlug = (
  slug: string | undefined
): PublicAppletNamespace | null => {
  if (!slug) return null

  return LEGACY_SLUG_TO_NAMESPACE[slug.toLowerCase()] ?? null
}

export const getAppletRouteSlugInfo = (
  slug: string | undefined
): AppletRouteSlugInfo | null => {
  if (!slug) return null

  const normalized = slug.toLowerCase()
  const canonicalNamespace = CANONICAL_SLUG_TO_NAMESPACE[normalized]
  if (canonicalNamespace) {
    return {
      namespace: canonicalNamespace,
      canonicalSlug: APPLET_PUBLIC_ROUTE_SLUGS[canonicalNamespace],
      isLegacy: false,
    }
  }

  const legacyNamespace = LEGACY_SLUG_TO_NAMESPACE[normalized]
  if (legacyNamespace) {
    return {
      namespace: legacyNamespace,
      canonicalSlug: APPLET_PUBLIC_ROUTE_SLUGS[legacyNamespace],
      isLegacy: true,
    }
  }

  return null
}

export const getAppletNamespaceForRouteSlug = (
  slug: string | undefined
): PublicAppletNamespace | null => getAppletRouteSlugInfo(slug)?.namespace ?? null

export const normalizeLegacyAppletSubpathSegments = ({
  namespace,
  segments,
}: {
  namespace: string
  segments: string[]
}) => {
  const redirects =
    (APPLET_LEGACY_SUBPATH_REDIRECTS[
      namespace as PublicAppletNamespace
    ] as Record<string, string> | undefined) ?? {}

  return segments.map((segment) => redirects[segment] ?? segment)
}
