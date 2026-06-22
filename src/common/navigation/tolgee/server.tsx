import { createServerInstance, detectLanguageFromHeaders } from '@tolgee/react/server'
import { headers } from 'next/headers'

import {
  TolgeeBase,
  ALL_NS_LANGS,
  DEFAULT_LOCALE,
  LOCALES,
  getStaticData,
} from './shared'

export const { getTolgee, getTranslate, T } = createServerInstance({
  getLocale: async () =>
    detectLanguageFromHeaders(await headers(), LOCALES) || DEFAULT_LOCALE,
  createTolgee: async (locale: string) =>
    TolgeeBase().init({
      // load all languages on the server
      staticData: await getStaticData(ALL_NS_LANGS),
      observerOptions: {
        fullKeyEncode: true,
      },
      language: locale,
      // using custom fetch to avoid aggressive caching
      fetch: async (input, init) => {
        const data = await fetch(input, { ...init, next: { revalidate: 0 } })
        return data
      },
    }),
})
