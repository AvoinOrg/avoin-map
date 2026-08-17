const WILDCARD = '*'

const fail = (message) => {
  throw new Error(`publicRoutes: ${message}`)
}

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeSlug = ({ slug, description }) => {
  if (typeof slug !== 'string' || !slug.trim()) {
    fail(`${description} must be a non-empty string.`)
  }

  return slug.trim().toLowerCase()
}

const normalizeSegments = ({ segments, description }) => {
  if (
    !Array.isArray(segments) ||
    segments.length === 0 ||
    segments.some((segment) => typeof segment !== 'string' || !segment)
  ) {
    fail(`${description} must be a non-empty array of non-empty strings.`)
  }

  return [...segments]
}

const normalizeRedirectPattern = ({ namespace, pattern, index }) => {
  if (!isRecord(pattern)) {
    fail(
      `publicRoute for "${namespace}" has an invalid redirect at index ${index}.`
    )
  }

  const from = normalizeSegments({
    segments: pattern.from,
    description: `redirect ${index} from segments for "${namespace}"`,
  })
  const to = normalizeSegments({
    segments: pattern.to,
    description: `redirect ${index} to segments for "${namespace}"`,
  })

  if (from.length !== to.length) {
    fail(
      `redirect ${index} for "${namespace}" must have matching segment counts.`
    )
  }

  const fromWildcards = from.filter((segment) => segment === WILDCARD).length
  const toWildcards = to.filter((segment) => segment === WILDCARD).length
  if (fromWildcards > 1 || toWildcards > 1 || fromWildcards !== toWildcards) {
    fail(
      `redirect ${index} for "${namespace}" must have one compatible wildcard at most.`
    )
  }
  if (from[0] === WILDCARD) {
    fail(
      `redirect ${index} for "${namespace}" must start with a literal segment.`
    )
  }

  for (let segmentIndex = 0; segmentIndex < from.length; segmentIndex += 1) {
    if ((from[segmentIndex] === WILDCARD) !== (to[segmentIndex] === WILDCARD)) {
      fail(
        `redirect ${index} for "${namespace}" has mismatched wildcard placement.`
      )
    }
  }

  return { from, to }
}

export const createPublicRouteContract = (appletConf) => {
  if (!isRecord(appletConf)) {
    fail('appletConf must be an object.')
  }

  const facts = []
  const factsByNamespace = Object.create(null)
  const canonicalSlugToNamespace = Object.create(null)
  const legacySlugToNamespace = Object.create(null)
  const allSlugs = new Map()
  const aliasesByNamespace = Object.create(null)
  const rootAliasesByNamespace = Object.create(null)

  const registerSlug = ({ namespace, slug, kind }) => {
    const existing = allSlugs.get(slug)
    if (existing) {
      fail(
        `duplicate normalized slug "${slug}" for ${kind} route of "${namespace}"; already used by ${existing.kind} route of "${existing.namespace}".`
      )
    }
    allSlugs.set(slug, { kind, namespace })
  }

  for (const [namespace, config] of Object.entries(appletConf)) {
    if (!isRecord(config) || !Object.hasOwn(config, 'publicRoute')) continue

    const publicRoute = config.publicRoute
    if (!isRecord(publicRoute)) {
      fail(`publicRoute for "${namespace}" must be an object.`)
    }

    const slug = normalizeSlug({
      slug: publicRoute.slug,
      description: `publicRoute.slug for "${namespace}"`,
    })
    if (!Array.isArray(publicRoute.legacySlugs)) {
      fail(`publicRoute.legacySlugs for "${namespace}" must be an array.`)
    }
    if (!Array.isArray(publicRoute.legacySubpathRedirects)) {
      fail(
        `publicRoute.legacySubpathRedirects for "${namespace}" must be an array.`
      )
    }

    const legacySlugs = publicRoute.legacySlugs.map((legacySlug, index) =>
      normalizeSlug({
        slug: legacySlug,
        description: `legacy slug ${index} for "${namespace}"`,
      })
    )
    const legacySubpathRedirects = publicRoute.legacySubpathRedirects.map(
      (pattern, index) =>
        normalizeRedirectPattern({ namespace, pattern, index })
    )

    registerSlug({ namespace, slug, kind: 'canonical' })
    canonicalSlugToNamespace[slug] = namespace
    for (const legacySlug of legacySlugs) {
      registerSlug({ namespace, slug: legacySlug, kind: 'legacy' })
      legacySlugToNamespace[legacySlug] = namespace
    }

    const aliases = Object.create(null)
    const rootAliases = new Set()
    for (const pattern of legacySubpathRedirects) {
      rootAliases.add(pattern.from[0])
      for (let index = 0; index < pattern.from.length; index += 1) {
        const fromSegment = pattern.from[index]
        const toSegment = pattern.to[index]
        if (fromSegment === WILDCARD) continue

        const existing = aliases[fromSegment]
        if (existing != null && existing !== toSegment) {
          fail(
            `conflicting redirect mapping for "${namespace}" segment "${fromSegment}": "${existing}" and "${toSegment}".`
          )
        }
        aliases[fromSegment] = toSegment
      }
    }

    const fact = { namespace, slug, legacySlugs, legacySubpathRedirects }
    facts.push(fact)
    factsByNamespace[namespace] = fact
    aliasesByNamespace[namespace] = aliases
    rootAliasesByNamespace[namespace] = rootAliases
  }

  const publicAppletNamespaces = facts.map(({ namespace }) => namespace)
  const getFact = (namespace) =>
    typeof namespace === 'string'
      ? factsByNamespace[namespace.toLowerCase()] || null
      : null

  const getPublicAppletRouteSlug = (namespace) =>
    getFact(namespace)?.slug ?? null
  const getRouteFolderForApplet = (namespace) =>
    getPublicAppletRouteSlug(namespace) || String(namespace).toLowerCase()

  const getAppletNamespaceForPublicRouteSlug = (slug) => {
    if (typeof slug !== 'string' || !slug) return null
    return canonicalSlugToNamespace[slug.toLowerCase()] || null
  }

  const getAppletNamespaceForLegacyRouteSlug = (slug) => {
    if (typeof slug !== 'string' || !slug) return null
    return legacySlugToNamespace[slug.toLowerCase()] || null
  }

  const getAppletRouteSlugInfo = (slug) => {
    const canonicalNamespace = getAppletNamespaceForPublicRouteSlug(slug)
    if (canonicalNamespace) {
      return {
        namespace: canonicalNamespace,
        canonicalSlug: factsByNamespace[canonicalNamespace].slug,
        isLegacy: false,
      }
    }

    const legacyNamespace = getAppletNamespaceForLegacyRouteSlug(slug)
    if (legacyNamespace) {
      return {
        namespace: legacyNamespace,
        canonicalSlug: factsByNamespace[legacyNamespace].slug,
        isLegacy: true,
      }
    }

    return null
  }

  const normalizeLegacyAppletSubpathSegments = ({ namespace, segments }) => {
    const aliases = aliasesByNamespace[String(namespace).toLowerCase()] || {}
    return segments.map((segment) => aliases[segment] || segment)
  }

  const normalizeLegacyAppletRootSubpathSegments = ({
    namespace,
    segments,
  }) => {
    const rootAliases =
      rootAliasesByNamespace[String(namespace).toLowerCase()] || new Set()
    return rootAliases.has(segments[0])
      ? normalizeLegacyAppletSubpathSegments({ namespace, segments })
      : segments
  }

  return {
    PUBLIC_APPLET_NAMESPACES: publicAppletNamespaces,
    PUBLIC_APPLET_ROUTE_FACTS: facts,
    getAppletNamespaceForLegacyRouteSlug,
    getAppletNamespaceForPublicRouteSlug,
    getAppletNamespaceForRouteSlug: (slug) =>
      getAppletRouteSlugInfo(slug)?.namespace ?? null,
    getAppletRouteSlugInfo,
    getLegacySubpathRedirects: (namespace) =>
      getFact(namespace)?.legacySubpathRedirects ?? [],
    getPublicAppletRouteSlug,
    getPublicRouteFact: getFact,
    getRouteFolderForApplet,
    isPublicAppletNamespace: (namespace) => getFact(namespace) != null,
    normalizeLegacyAppletRootSubpathSegments,
    normalizeLegacyAppletSubpathSegments,
  }
}
