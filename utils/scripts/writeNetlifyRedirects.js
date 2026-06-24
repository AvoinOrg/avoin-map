const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { parseCompiledApplets } = require('./appletBuildConfig')

dotenv.config({ quiet: true })

const MAIN_APPLET = 'main'
const VISIBLE_REDIRECT_STATUS = '301!'

const AUTO_GENERATED_COMMENT =
  '# --- AUTO-GENERATED RULES FROM writeNetlifyRedirects.js ---'

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

const APPLET_PATH_ALIASES = {
  energymap: 'energiakartta',
}

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

  return env[`NEXT_PUBLIC_APPLET_${upperNamespace}_DOMAIN`]
}

const getDomains = ({ namespace, appletConf, env }) => [
  ...(appletConf[namespace]?.domains || []),
  getEnvDomain({ namespace, env }),
]

const getPathAliasesForNamespace = (namespace) =>
  Object.entries(APPLET_PATH_ALIASES)
    .filter(([, targetNamespace]) => targetNamespace === namespace)
    .map(([alias]) => alias)

const getSelectedAppletNamespaces = ({ appletConf, compiledApplets }) => {
  const knownNamespaces = Object.keys(appletConf).filter(
    (namespace) => namespace !== MAIN_APPLET
  )

  if (compiledApplets.length === 0) {
    return {
      mode: 'main',
      namespaces: knownNamespaces,
    }
  }

  const includesMain = compiledApplets.includes(MAIN_APPLET)
  const selected = compiledApplets.filter(
    (namespace) => namespace !== MAIN_APPLET && appletConf[namespace]
  )

  return {
    mode: includesMain ? 'main' : 'standalone',
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

const addProxyRulesForDomain = ({
  appletConf,
  baseUrl,
  domainBase,
  mode,
  namespace,
  rules,
}) => {
  const defaultLocale = getDefaultLocale({ namespace, appletConf })
  const locales = getLocales({ namespace, appletConf })
  const knownUnsupportedLocales = getKnownUnsupportedLocales({
    namespace,
    appletConf,
  })
  const knownLocales = getKnownLocales(appletConf)

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
    const localizedAppletBase = `/${locale}/${namespace}`
    const apiTarget =
      mode === 'standalone'
        ? `/${locale}/api/:splat`
        : `/${locale}/${namespace}/api/:splat`
    const localeRootTarget =
      mode === 'standalone' ? `/${locale}` : `/${locale}/${namespace}`
    const localeCatchAllTarget =
      mode === 'standalone'
        ? `/${locale}/:splat`
        : `/${locale}/${namespace}/:splat`
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

    if (mode === 'main') {
      for (const alias of getPathAliasesForNamespace(namespace)) {
        addExactAndSplatRules({
          baseUrl,
          exactFrom: `${domainBase}/${locale}/${alias}`,
          exactTo: localizedAppletBase,
          rules,
          splatFrom: `${domainBase}/${locale}/${alias}/*`,
          splatTo: `${localizedAppletBase}/:splat`,
        })
      }
    }

    addRule({
      rules,
      from: `${domainBase}/${locale}`,
      to: targetFor({ baseUrl, path: localeRootTarget }),
    })
    addRule({
      rules,
      from: `${domainBase}/${locale}/*`,
      to: targetFor({ baseUrl, path: localeCatchAllTarget }),
    })
  }

  for (const unsupportedLocale of knownUnsupportedLocales) {
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

const generateNetlifyRedirects = ({
  appletConf,
  baseUrl,
  compiledApplets = [],
  env = process.env,
}) => {
  const rules = []
  const selected = getSelectedAppletNamespaces({ appletConf, compiledApplets })

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
          rules,
        })
      }
    }
  }

  return `${AUTO_GENERATED_COMMENT}
# Generated for TanStack Start Netlify output. Specific static/API rules must
# stay before the applet domain catch-all rewrites below.
${baseUrl ? `# Proxy target: ${baseUrl}` : '# Proxy target: same Netlify site'}

${rules.join('\n')}
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
  const compiledApplets = parseCompiledApplets(
    args['compiled-applets'] || process.env.NEXT_PUBLIC_COMPILED_APPLETS
  )
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
    `writeNetlifyRedirects: wrote ${redirects
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#')).length} rule(s) to ${outputPath}`
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
  parseCompiledApplets,
  writeRedirectsFile,
}
