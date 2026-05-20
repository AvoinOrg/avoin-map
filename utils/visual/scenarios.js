const appletConf = require('../../appletConf.json')
const {
  DEFAULT_MASK_SELECTORS,
  DEFAULT_WAIT_FOR_SELECTOR,
} = require('./constants')

const MAIN_APPLET = 'main'
const DEFAULT_MAIN_LOCALE = 'en'

const parseCompiledApplets = (raw) =>
  String(raw || '')
    .toLowerCase()
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

const unique = (values) => Array.from(new Set(values))

const getKnownApplets = () => Object.keys(appletConf)

const getCompiledApplets = ({ env = process.env } = {}) => {
  const parsed = parseCompiledApplets(env.NEXT_PUBLIC_COMPILED_APPLETS)
  const known = new Set(getKnownApplets())

  if (parsed.length === 0) {
    return getKnownApplets()
  }

  return unique(parsed.filter((name) => known.has(name)))
}

const isStandaloneAppletBuild = ({ env = process.env } = {}) => {
  const compiled = getCompiledApplets({ env })
  return compiled.length === 1 && compiled[0] !== MAIN_APPLET
}

const getAppletLocale = (applet) => {
  const langs =
    appletConf[applet] && Array.isArray(appletConf[applet].langs)
      ? appletConf[applet].langs
      : []

  if (applet === MAIN_APPLET && langs.includes(DEFAULT_MAIN_LOCALE)) {
    return DEFAULT_MAIN_LOCALE
  }

  return langs[0] || DEFAULT_MAIN_LOCALE
}

const joinUrl = ({ baseUrl, path }) => {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '')
  if (!normalizedBaseUrl) {
    return path
  }
  return `${normalizedBaseUrl}${path}`
}

const buildScenario = ({
  id,
  applet,
  locale,
  path,
  baseUrl,
  requiresWebGL = false,
}) => ({
  id,
  applet,
  locale,
  path,
  url: joinUrl({ baseUrl, path }),
  requiresWebGL,
  waitFor: DEFAULT_WAIT_FOR_SELECTOR,
  maskSelectors: [...DEFAULT_MASK_SELECTORS],
  tags: ['root', `applet:${applet}`],
})

const buildVisualScenarios = ({ env = process.env, baseUrl = '' } = {}) => {
  const compiled = getCompiledApplets({ env })
  const standalone = isStandaloneAppletBuild({ env })

  if (standalone) {
    const applet = compiled[0]
    const locale = getAppletLocale(applet)
    return [
      buildScenario({
        id: `${applet}-root`,
        applet,
        locale,
        path: `/${locale}`,
        baseUrl,
        requiresWebGL: true,
      }),
    ]
  }

  const scenarios = []

  if (compiled.includes(MAIN_APPLET)) {
    const locale = getAppletLocale(MAIN_APPLET)
    scenarios.push(
      buildScenario({
        id: 'main-root',
        applet: MAIN_APPLET,
        locale,
        path: `/${locale}`,
        baseUrl,
        requiresWebGL: true,
      })
    )
  }

  for (const applet of compiled) {
    if (applet === MAIN_APPLET) continue
    const locale = getAppletLocale(applet)
    scenarios.push(
      buildScenario({
        id: `${applet}-root`,
        applet,
        locale,
        path: `/${locale}/${applet}`,
        baseUrl,
        requiresWebGL: true,
      })
    )
  }

  return scenarios
}

module.exports = {
  DEFAULT_MAIN_LOCALE,
  MAIN_APPLET,
  buildVisualScenarios,
  getCompiledApplets,
  getKnownApplets,
  isStandaloneAppletBuild,
  parseCompiledApplets,
}
