import { DevTools, Tolgee } from '@tolgee/web'
import { FormatIcu } from '@tolgee/format-icu'

import appletConf from '../../../../appletConf.json'

const parseCompiledApplets = (raw?: string) =>
  (raw || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

type AppletKey = keyof typeof appletConf

const compiledAppletsRaw = parseCompiledApplets(
  process.env.NEXT_PUBLIC_COMPILED_APPLETS
)

const compiledAppletKeys = (
  compiledAppletsRaw.length > 0
    ? compiledAppletsRaw
    : (Object.keys(appletConf) as string[])
).filter((k) => k in appletConf) as AppletKey[]

const toUnique = (values: string[]) => Array.from(new Set(values))

const desiredLangs = toUnique(
  compiledAppletKeys.flatMap((key) => {
    const conf = appletConf[key]
    return Array.isArray(conf?.langs) ? conf.langs : []
  })
)

export const ALL_NS_LANGS: Record<string, { langs: string[] }> = (() => {
  const acc = compiledAppletKeys.reduce((a, key) => {
    const conf = appletConf[key]
    const ns = conf?.localeNs
    if (!ns) return a

    const langs = Array.isArray(conf.langs) ? conf.langs : []
    const prev = a[ns]?.langs ?? []
    a[ns] = { langs: toUnique(prev.concat(langs)) }
    return a
  }, {} as Record<string, { langs: string[] }>)

  // Shared UI strings live in the "main" namespace (avoin-map). Even when
  // building a standalone applet, we still want those translations for the
  // locales that the active applet supports.
  const mainNs = appletConf.main?.localeNs
  if (mainNs && !acc[mainNs]) {
    const mainLangs = Array.isArray(appletConf.main?.langs)
      ? appletConf.main.langs
      : []

    let langs = desiredLangs.length > 0 ? desiredLangs : mainLangs
    const intersect = langs.filter((l) => mainLangs.includes(l))
    if (intersect.length > 0) langs = intersect

    if (langs.length > 0) {
      acc[mainNs] = { langs }
    }
  }

  return acc
})()

export const DEFAULT_LOCALE = 'en'
export const DEFAULT_NS = 'avoin-map'

const localesSet = new Set<string>()

for (const key in ALL_NS_LANGS) {
  const langs = ALL_NS_LANGS[key]?.langs ?? []
  langs.forEach((lang: string) => localesSet.add(lang))
}

export const LOCALES = Array.from(localesSet)

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL

export const getStaticData = async (nsLangs: {
  [key: string]: { langs: string[] }
}) => {
  const result: Record<string, any> = {}
  for (const namespace of Object.keys(nsLangs)) {
    for (const lang of nsLangs[namespace].langs) {
      result[`${lang}:${namespace}`] = (
        await import(`@i18n/${namespace}/${lang}.json`)
      ).default
    }
  }
  return result
}

export const getLocaleObj = (locale: string) => {
  const locales: Record<string, { langs: string[] }> = {}

  for (const ns of Object.keys(ALL_NS_LANGS)) {
    if (ALL_NS_LANGS[ns].langs.includes(locale)) {
      locales[ns] = { langs: [locale] }
    }
  }

  return locales
}

export const getLocalesForApplet = (applet: string): string[] => {
  const key = applet.toLowerCase() as AppletKey
  const conf = appletConf[key]
  return conf?.langs ?? []
}

export function TolgeeBase() {
  return (
    Tolgee()
      .use(FormatIcu())
      .use(DevTools())
      // Preset shared settings
      .updateDefaults({
        language: DEFAULT_LOCALE,
        defaultNs: DEFAULT_NS,
        ...(apiUrl && {
          apiUrl: apiUrl,
        }),
        ...(apiKey && {
          apiKey: apiKey,
        }),
      })
  )
}
