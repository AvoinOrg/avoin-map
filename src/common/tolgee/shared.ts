import { DevTools, Tolgee } from '@tolgee/web'
import { FormatIcu } from '@tolgee/format-icu'

import tolgeeLocales from '../../../localeConf.json'

export const ALL_NS_LANGS = tolgeeLocales
export const DEFAULT_LOCALE = 'en'
export const DEFAULT_NS = 'avoin-map'

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL

export const getStaticData = async (nsLangs: { [key: string]: string[] }) => {
  const result: Record<string, any> = {}
  for (const lang of Object.keys(nsLangs)) {
    for (const namespace of nsLangs[lang]) {
      result[`${lang}:${namespace}`] = (
        await import(`../i18n/${lang}.json`)
      ).default
    }
  }
  return result
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
