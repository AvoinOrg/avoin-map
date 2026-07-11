const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { resolveCompiledAppletConfig } = require('./appletBuildConfig')
const { createPublicRouteContract } = require('./publicRoutes')

dotenv.config({ quiet: true })

const VISIBLE_REDIRECT_STATUS = '301!'

const AUTO_GENERATED_COMMENT =
  '# --- AUTO-GENERATED RULES FROM writeNetlifyRedirects.js ---'
const NETLIFY_SERVER_FALLBACK_RULE = '/* /.netlify/functions/server 200'

const START_STATIC_SPLAT_PATHS = [
  '/assets/*',
  '/_build/*',
  '/_serverFn/*',
  '/files/*',
  '/lib/*',
]

const START_STATIC_EXACT_PATHS = [
  '/favicon.ico',
  '/apple-icon.png',
  '/icon.svg',
  '/robots.txt',
  '/sitemap.xml',
]

const GLOBAL_SERVER_SPLAT_PATHS = ['/api/*']
const COMMON_LOCALIZED_SPLAT_PATHS = ['/adds/*']

const parseArgs = (argv) => {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) continue

    const key = arg.slice(2)
    const value = argv[index + 1]

    if (value == null || value.startsWith('--')) {
      args[key] = 'true'
      continue
    }

    args[key] = value
    index += 1
  }

  return args
}

const normalizeBaseUrl = (value) => {
  if (!value) return null

  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return null

  try {
    const url = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    )
    return url.origin
  } catch {
    return null
  }
}

const normalizeDomain = (value) => {
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
      protocols:
        trimmed.startsWith('http://') || trimmed.startsWith('https://')
          ? [url.protocol.replace(':', '')]
          : ['https', 'http'],
    }
  } catch {
    return null
  }
}

const getDefaultLocale = ({ namespace, appletConf }) =>
  appletConf[namespace]?.langs?.[0] || 'en'

const getLocales = ({ namespace, appletConf }) =>
  appletConf[namespace]?.langs || []

const getKnownLocales = (appletConf) => {
  const locales = new Set()

  for (const config of Object.values(appletConf)) {
    for (const locale of config.langs || []) {
      locales.add(locale)
    }
  }

  return Array.from(locales)
}

const getKnownUnsupportedLocales = ({ namespace, appletConf }) => {
  const allowedLocales = new Set(getLocales({ namespace, appletConf }))

  return getKnownLocales(appletConf).filter(
    (locale) => !allowedLocales.has(locale)
  )
}

const getEnvDomain = ({ namespace, env }) => {
  const upperNamespace = namespace.toUpperCase()
  return env[`PUBLIC_APPLET_${upperNamespace}_DOMAIN`]
}

const getDomains = ({ namespace, appletConf, env }) => [
  ...(appletConf[namespace]?.domains || []),
  getEnvDomain({ namespace, env }),
]

const getApiRouteBase = ({ namespace, appletConf }) =>
  appletConf[namespace]?.apiRouteBase || namespace

const getSelectedAppletNamespaces = ({ selection, publicRoutes }) => {
  const selected = selection.compiledNonMain.filter((namespace) =>
    publicRoutes.isPublicAppletNamespace(namespace)
  )

  return {
    mode: selection.isStandalone ? 'standalone' : 'main',
    namespaces: selected,
  }
}

const targetFor = ({ baseUrl, path: targetPath }) =>
  baseUrl ? `${baseUrl}${targetPath}` : targetPath

const toSplatTarget = (sourcePath) => sourcePath.replace(/\*$/, ':splat')

const addRule = ({ rules, from, to, status = '200!' }) => {
  rules.push(`${from} ${to} ${status}`)
}

const addVisibleRedirectRule = ({ rules, from, to }) => {
  addRule({
    rules,
    from,
    to,
    status: VISIBLE_REDIRECT_STATUS,
  })
}

const addExactAndSplatRules = ({
  baseUrl,
  exactFrom,
  exactTo,
  rules,
  splatFrom,
  splatTo,
}) => {
  addRule({
    rules,
    from: exactFrom,
    to: targetFor({ baseUrl, path: exactTo }),
  })
  addRule({
    rules,
    from: splatFrom,
    to: targetFor({ baseUrl, path: splatTo }),
  })
}

const addLegacySubpathRedirects = ({ fromBase, patterns, rules, toBase }) => {
  for (const pattern of patterns) {
    addVisibleRedirectRule({
      rules,
      from: `${fromBase}/${pattern.from.join('/')}`,
      to: `${toBase}/${pattern.to
        .map((segment) => (segment === '*' ? ':splat' : segment))
        .join('/')}`,
    })
  }
}

const addStandaloneRootAliasRedirects = ({
  fromLocaleBase,
  patterns,
  rules,
  toLocaleBase,
}) => {
  addLegacySubpathRedirects({
    fromBase: fromLocaleBase,
    patterns,
    rules,
    toBase: toLocaleBase,
  })
}

const addProxyRulesForDomain = ({
  appletConf,
  baseUrl,
  domainBase,
  mode,
  namespace,
  publicRoutes,
  rules,
}) => {
  const defaultLocale = getDefaultLocale({ namespace, appletConf })
  const locales = getLocales({ namespace, appletConf })
  const knownUnsupportedLocales = getKnownUnsupportedLocales({
    namespace,
    appletConf,
  })
  const knownLocales = getKnownLocales(appletConf)
  const legacySubpathRedirects =
    publicRoutes.getLegacySubpathRedirects(namespace)

  for (const sourcePath of START_STATIC_SPLAT_PATHS) {
    addRule({
      rules,
      from: `${domainBase}${sourcePath}`,
      to: targetFor({ baseUrl, path: toSplatTarget(sourcePath) }),
    })
  }

  for (const sourcePath of START_STATIC_EXACT_PATHS) {
    addRule({
      rules,
      from: `${domainBase}${sourcePath}`,
      to: targetFor({ baseUrl, path: sourcePath }),
    })
  }

  for (const sourcePath of GLOBAL_SERVER_SPLAT_PATHS) {
    addRule({
      rules,
      from: `${domainBase}${sourcePath}`,
      to: targetFor({ baseUrl, path: toSplatTarget(sourcePath) }),
    })
  }

  for (const sourcePath of COMMON_LOCALIZED_SPLAT_PATHS) {
    addRule({
      rules,
      from: `${domainBase}${sourcePath}`,
      to: targetFor({ baseUrl, path: toSplatTarget(sourcePath) }),
    })

    for (const locale of knownLocales) {
      addRule({
        rules,
        from: `${domainBase}/${locale}${sourcePath}`,
        to: targetFor({
          baseUrl,
          path: `/${locale}${toSplatTarget(sourcePath)}`,
        }),
      })
    }
  }

  for (const locale of locales) {
    const publicSlug = publicRoutes.getPublicAppletRouteSlug(namespace)
    const localizedAppletBase = `/${locale}/${publicSlug}`
    const apiTarget = `/api/${getApiRouteBase({
      namespace,
      appletConf,
    })}/:splat`
    const localizedAppletTarget =
      mode === 'standalone' ? `/${locale}` : localizedAppletBase
    const localizedAppletCatchAllTarget =
      mode === 'standalone'
        ? `/${locale}/:splat`
        : `${localizedAppletBase}/:splat`

    addRule({
      rules,
      from: `${domainBase}/${locale}/api/*`,
      to: targetFor({ baseUrl, path: apiTarget }),
    })

    const localizedVisibleAppletBase =
      mode === 'standalone' ? `/${locale}` : localizedAppletBase

    addLegacySubpathRedirects({
      fromBase: `${domainBase}${localizedAppletBase}`,
      patterns: legacySubpathRedirects,
      rules,
      toBase: localizedVisibleAppletBase,
    })

    if (mode === 'standalone') {
      addStandaloneRootAliasRedirects({
        fromLocaleBase: `${domainBase}/${locale}`,
        patterns: legacySubpathRedirects,
        rules,
        toLocaleBase: `/${locale}`,
      })
    }

    if (mode === 'standalone') {
      addVisibleRedirectRule({
        rules,
        from: `${domainBase}${localizedAppletBase}`,
        to: `/${locale}`,
      })
      addVisibleRedirectRule({
        rules,
        from: `${domainBase}${localizedAppletBase}/*`,
        to: `/${locale}/:splat`,
      })
    } else {
      addExactAndSplatRules({
        baseUrl,
        exactFrom: `${domainBase}${localizedAppletBase}`,
        exactTo: localizedAppletTarget,
        rules,
        splatFrom: `${domainBase}${localizedAppletBase}/*`,
        splatTo: localizedAppletCatchAllTarget,
      })
    }

    if (mode === 'standalone') {
      addRule({
        rules,
        from: `${domainBase}/${locale}`,
        to: targetFor({ baseUrl, path: `/${locale}` }),
      })
      addRule({
        rules,
        from: `${domainBase}/${locale}/*`,
        to: targetFor({ baseUrl, path: `/${locale}/:splat` }),
      })
    }
  }

  if (mode === 'standalone') {
    for (const unsupportedLocale of knownUnsupportedLocales) {
      addStandaloneRootAliasRedirects({
        fromLocaleBase: `${domainBase}/${unsupportedLocale}`,
        patterns: legacySubpathRedirects,
        rules,
        toLocaleBase: `/${defaultLocale}`,
      })

      addVisibleRedirectRule({
        rules,
        from: `${domainBase}/${unsupportedLocale}`,
        to: `/${defaultLocale}`,
      })
      addVisibleRedirectRule({
        rules,
        from: `${domainBase}/${unsupportedLocale}/*`,
        to: `/${defaultLocale}/:splat`,
      })
    }
  }

  if (mode === 'standalone') {
    addStandaloneRootAliasRedirects({
      fromLocaleBase: domainBase,
      patterns: legacySubpathRedirects,
      rules,
      toLocaleBase: `/${defaultLocale}`,
    })

    addVisibleRedirectRule({
      rules,
      from: `${domainBase}/`,
      to: `/${defaultLocale}`,
    })
    addVisibleRedirectRule({
      rules,
      from: `${domainBase}/*`,
      to: `/${defaultLocale}/:splat`,
    })
  }
}

const generateNetlifyRedirects = ({
  appletConf,
  baseUrl,
  compiledApplets,
  env = process.env,
}) => {
  const selection = resolveCompiledAppletConfig({
    appletConf,
    raw: compiledApplets,
    scriptName: 'writeNetlifyRedirects',
  })
  const rules = []
  const publicRoutes = createPublicRouteContract(appletConf)
  const selected = getSelectedAppletNamespaces({
    selection,
    publicRoutes,
  })

  for (const namespace of selected.namespaces) {
    for (const domain of getDomains({ namespace, appletConf, env })) {
      const normalizedDomain = normalizeDomain(domain)
      if (!normalizedDomain) continue

      for (const protocol of normalizedDomain.protocols) {
        addProxyRulesForDomain({
          appletConf,
          baseUrl,
          domainBase: `${protocol}://${normalizedDomain.host}`,
          mode: selected.mode,
          namespace,
          publicRoutes,
          rules,
        })
      }
    }
  }

  const allRules = [...rules, NETLIFY_SERVER_FALLBACK_RULE]

  return `${AUTO_GENERATED_COMMENT}
# Generated for TanStack Start Netlify output. Specific static/API rules must
# stay before the applet domain catch-all rewrites below.
${baseUrl ? `# Proxy target: ${baseUrl}` : '# Proxy target: same Netlify site'}

${allRules.join('\n')}
`
}

const writeRedirectsFile = ({
  appletConf,
  baseUrl,
  compiledApplets,
  outputPath,
}) => {
  const redirects = generateNetlifyRedirects({
    appletConf,
    baseUrl,
    compiledApplets,
  })

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, redirects, 'utf8')

  return redirects
}

const main = () => {
  const args = parseArgs(process.argv.slice(2))
  const projectRoot = path.resolve(args['project-root'] || process.cwd())
  const appletConfPath = path.join(projectRoot, 'appletConf.json')
  const appletConf = JSON.parse(fs.readFileSync(appletConfPath, 'utf8'))
  const compiledApplets =
    args['compiled-applets'] ?? process.env.PUBLIC_COMPILED_APPLETS
  const baseUrl = normalizeBaseUrl(
    args['base-url'] ||
      process.env.NETLIFY_REDIRECTS_BASE_URL ||
      process.env.DEPLOY_PRIME_URL ||
      process.env.URL
  )
  const outputPath = path.resolve(
    projectRoot,
    args.out ||
      process.env.NETLIFY_REDIRECTS_OUTPUT ||
      path.join('dist', '_redirects')
  )

  const redirects = writeRedirectsFile({
    appletConf,
    baseUrl,
    compiledApplets,
    outputPath,
  })

  console.log(
    `writeNetlifyRedirects: wrote ${
      redirects
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#')).length
    } rule(s) to ${outputPath}`
  )

  if (!baseUrl) {
    console.log(
      'writeNetlifyRedirects: DEPLOY_PRIME_URL/URL/NETLIFY_REDIRECTS_BASE_URL is unset; generated same-site targets.'
    )
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  generateNetlifyRedirects,
  normalizeBaseUrl,
  writeRedirectsFile,
}
