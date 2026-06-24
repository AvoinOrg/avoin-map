/// <reference types="vite/client" />

import type { TolgeeStaticData } from '@tolgee/web'

type NamespaceLangs = Record<string, { langs: string[] }>
type JsonModule = {
  default: TolgeeStaticData[string]
}

const translationModules = import.meta.glob<JsonModule>(
  '../../../i18n/*/*.json',
  { eager: true }
)

const getTranslationModulePath = (namespace: string, lang: string) =>
  `../../../i18n/${namespace}/${lang}.json`

export const getStartStaticData = (nsLangs: NamespaceLangs) => {
  const result: TolgeeStaticData = {}

  for (const namespace of Object.keys(nsLangs)) {
    for (const lang of nsLangs[namespace]?.langs ?? []) {
      const modulePath = getTranslationModulePath(namespace, lang)
      const translationModule = translationModules[modulePath]

      if (!translationModule) {
        throw new Error(
          `Missing Tolgee static export for namespace "${namespace}" and language "${lang}" at ${modulePath}`
        )
      }

      result[`${lang}:${namespace}`] = translationModule.default
    }
  }

  return result
}
