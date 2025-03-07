import { createServerInstance, detectLanguageFromHeaders } from '@tolgee/react/server'

import { TolgeeBase, ALL_NS_LANGS, getStaticData } from './shared'

export const { getTolgee, getTranslate, T } = createServerInstance({
  getLocale: detectLanguageFromHeaders,
  createTolgee: async (locale: any) =>
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
