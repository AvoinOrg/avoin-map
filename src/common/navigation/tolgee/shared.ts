import { DevTools, Tolgee } from '@tolgee/web'
import { FormatIcu } from '@tolgee/format-icu'

import appletConf from '../../../../appletConf.json'
import {
  resolveRuntimeAppletSelection,
  runtimeAppletSelection,
  type RuntimeAppletSelection,
} from '#/common/routing/appletBuildMode'

type AppletKey = keyof typeof appletConf
type AppletConfig = { localeNs?: string; langs?: string[] }
const conf = appletConf as Record<AppletKey, AppletConfig>

const toUnique = (values: string[]) => Array.from(new Set(values))

export const createTolgeeSelectionConfig = (
  selection: RuntimeAppletSelection
) => {
  const compiledAppletKeys = selection.compiledApplets as readonly AppletKey[]
  const desiredLangs = toUnique(
    compiledAppletKeys.flatMap((key) => conf[key].langs ?? [])
  )
  const allNsLangs = compiledAppletKeys.reduce((acc, key) => {
    const applet = conf[key]
    const ns = applet.localeNs
    if (!ns) return acc

    const prev = acc[ns]?.langs ?? []
    acc[ns] = { langs: toUnique(prev.concat(applet.langs ?? [])) }
    return acc
  }, {} as Record<string, { langs: string[] }>)

  // Shared UI strings live in the "main" namespace (avoin-map). Even when
  // building a standalone applet, we still want those translations for the
  // locales that the active applet supports.
  const mainNs = conf.main.localeNs
  if (mainNs && !allNsLangs[mainNs]) {
    const mainLangs = conf.main.langs ?? []
    const langs = desiredLangs.filter((lang) => mainLangs.includes(lang))

    if (langs.length > 0) {
      allNsLangs[mainNs] = { langs }
    }
  }

  const locales = toUnique(
    Object.values(allNsLangs).flatMap(({ langs }) => langs)
  )

  return { allNsLangs, locales, selection }
}

export const resolveTolgeeSelectionConfig = (raw?: string | string[]) =>
  createTolgeeSelectionConfig(resolveRuntimeAppletSelection(raw))

const tolgeeSelectionConfig = createTolgeeSelectionConfig(
  runtimeAppletSelection
)

export const ALL_NS_LANGS = tolgeeSelectionConfig.allNsLangs

export const DEFAULT_LOCALE = 'en'
export const DEFAULT_NS = 'avoin-map'

export const LOCALES = tolgeeSelectionConfig.locales

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL

export const getStaticData = async (nsLangs: {
  [key: string]: { langs: string[] }
}) => {
  const result: Record<string, any> = {}
  for (const namespace of Object.keys(nsLangs)) {
    for (const lang of nsLangs[namespace].langs) {
      result[`${lang}:${namespace}`] = (
        await import(/* @vite-ignore */ `@i18n/${namespace}/${lang}.json`)
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
