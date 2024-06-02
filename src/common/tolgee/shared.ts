import { DevTools, Tolgee } from '@tolgee/web'
import { FormatIcu } from '@tolgee/format-icu'

import tolgeeLocales from '../../../localeConf.json'

export const ALL_NS_LANGS = tolgeeLocales
export const DEFAULT_LOCALE = 'en'
export const DEFAULT_NS = 'avoin-map'

const localesSet = new Set<string>()

for (const key in tolgeeLocales) {
  if (tolgeeLocales.hasOwnProperty(key)) {
    // @ts-ignore
    const langs = tolgeeLocales[key].langs
    langs.forEach((lang: string) => localesSet.add(lang))
  }
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
        await import(`../../i18n/${namespace}/${lang}.json`)
      ).default
    }
  }
  return result
}

export const getLocaleObj = (locale: string) => {
  const locales: Record<string, { langs: string[] }> = {}

  for (const ns of Object.keys(ALL_NS_LANGS) as Array<
    keyof typeof ALL_NS_LANGS
  >) {
    if (ALL_NS_LANGS[ns].langs.includes(locale)) {
      locales[ns] = { langs: [locale] }
    }
  }

  return locales
}

export const getLocalesForNs = (ns: keyof typeof ALL_NS_LANGS) => {
  return ALL_NS_LANGS[ns].langs
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
