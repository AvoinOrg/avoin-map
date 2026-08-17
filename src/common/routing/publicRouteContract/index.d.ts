export type LegacySubpathRedirect = {
  from: string[]
  to: string[]
}

export type PublicAppletRouteFact<Namespace extends string = string> = {
  namespace: Namespace
  slug: string
  legacySlugs: string[]
  legacySubpathRedirects: LegacySubpathRedirect[]
}

export type AppletRouteSlugInfo<Namespace extends string = string> = {
  namespace: Namespace
  canonicalSlug: string
  isLegacy: boolean
}

export type PublicRouteContract<Namespace extends string = string> = {
  PUBLIC_APPLET_NAMESPACES: Namespace[]
  PUBLIC_APPLET_ROUTE_FACTS: PublicAppletRouteFact<Namespace>[]
  getAppletNamespaceForLegacyRouteSlug: (
    slug: string | undefined
  ) => Namespace | null
  getAppletNamespaceForPublicRouteSlug: (
    slug: string | undefined
  ) => Namespace | null
  getAppletNamespaceForRouteSlug: (
    slug: string | undefined
  ) => Namespace | null
  getAppletRouteSlugInfo: (
    slug: string | undefined
  ) => AppletRouteSlugInfo<Namespace> | null
  getLegacySubpathRedirects: (namespace: string) => LegacySubpathRedirect[]
  getPublicAppletRouteSlug: (namespace: string) => string | null
  getPublicRouteFact: (
    namespace: string
  ) => PublicAppletRouteFact<Namespace> | null
  getRouteFolderForApplet: (namespace: string) => string
  isPublicAppletNamespace: (namespace: string) => namespace is Namespace
  normalizeLegacyAppletRootSubpathSegments: (options: {
    namespace: string
    segments: string[]
  }) => string[]
  normalizeLegacyAppletSubpathSegments: (options: {
    namespace: string
    segments: string[]
  }) => string[]
}

export const createPublicRouteContract: <Namespace extends string = string>(
  appletConf: unknown
) => PublicRouteContract<Namespace>
