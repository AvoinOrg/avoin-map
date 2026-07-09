const PUBLIC_APPLET_NAMESPACES = [
  'energy',
  'carbon',
  'luonnonmetsakartat',
]

const APPLET_PUBLIC_ROUTE_SLUGS = {
  energy: 'energy',
  carbon: 'carbon',
  luonnonmetsakartat: 'luonnonmetsakartat',
}

const APPLET_LEGACY_PUBLIC_ROUTE_SLUGS = {
  energy: [],
  carbon: [],
  luonnonmetsakartat: [],
}

const APPLET_LEGACY_SUBPATH_REDIRECTS = {
  energy: {},
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
}

const CANONICAL_SLUG_TO_NAMESPACE = Object.fromEntries(
  PUBLIC_APPLET_NAMESPACES.map((namespace) => [
    APPLET_PUBLIC_ROUTE_SLUGS[namespace],
    namespace,
  ])
)

const LEGACY_SLUG_TO_NAMESPACE = Object.fromEntries(
  PUBLIC_APPLET_NAMESPACES.flatMap((namespace) =>
    APPLET_LEGACY_PUBLIC_ROUTE_SLUGS[namespace].map((slug) => [
      slug,
      namespace,
    ])
  )
)

const getPublicAppletRouteSlug = (namespace) =>
  APPLET_PUBLIC_ROUTE_SLUGS[namespace] || namespace

const getAppletRouteSlugInfo = (slug) => {
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

const normalizeLegacyAppletSubpathSegments = ({ namespace, segments }) => {
  const redirects = APPLET_LEGACY_SUBPATH_REDIRECTS[namespace] || {}

  return segments.map((segment) => redirects[segment] || segment)
}

module.exports = {
  APPLET_LEGACY_PUBLIC_ROUTE_SLUGS,
  APPLET_LEGACY_SUBPATH_REDIRECTS,
  APPLET_PUBLIC_ROUTE_SLUGS,
  PUBLIC_APPLET_NAMESPACES,
  getAppletRouteSlugInfo,
  getPublicAppletRouteSlug,
  normalizeLegacyAppletSubpathSegments,
}
