import {
  DEFAULT_NS,
  getLocaleObj,
  TolgeeBase,
} from '#/common/navigation/tolgee/shared'
import {
  ARIMO_FONT_VARIABLE_STYLE,
  ARIMO_GOOGLE_FONTS_STYLESHEET,
} from '#/common/style/theme/fonts'
import { getUmamiScriptConfig } from '#/common/utils/umami'
import { getStartStaticData } from '#/start/tolgee/staticData'

export const AVOIN_MAP_TITLE = 'Avoin Map'
export const ENERGIAKARTTA_TITLE = 'Energiakartta'
export const LUONNONMETSAKARTAT_TITLE = 'Luonnonmetsakartat'
export const LUONNONMETSAKARTAT_ADMIN_TITLE =
  'Luonnonmetsakartat / Admin'
export const LUONNONMETSAKARTAT_IMPORT_TITLE =
  'Luonnonmetsakartat / Admin - Tuo karttatiedosto'
export const LUONNONMETSAKARTAT_FOLAYER_TITLE =
  'Luonnonmetsakartat / Admin - Karttataso'
export const LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE =
  'Luonnonmetsakartat / Admin - Karttatason asetukset'
export const LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE =
  'Luonnonmetsakartat / Admin - Tuo kuvia karttatasoon'

const HIILIKARTTA_NAMESPACE = 'hiilikartta'
const HIILIKARTTA_METADATA_TITLE_KEY = 'meta.title'
const HIILIKARTTA_METADATA_DESCRIPTION_KEY = 'meta.description'
const HIILIKARTTA_APPLET_TITLE_KEY =
  'sidebar.main.bubbles.hiilikartta.title'
const HIILIKARTTA_APPLET_DESCRIPTION_KEY =
  'sidebar.main.bubbles.hiilikartta.description'

type AppletHeadArgs = {
  title: string
  umamiWebsiteId?: string
}

type HiilikarttaHeadArgs = {
  locale: string
  umamiWebsiteId?: string
}

const SITE_NAME = AVOIN_MAP_TITLE

export const getRootHead = () => ({
  meta: [
    {
      charSet: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      title: AVOIN_MAP_TITLE,
    },
  ],
  links: [
    {
      rel: 'icon',
      href: '/files/favicon.ico',
    },
    {
      rel: 'shortcut icon',
      href: '/files/favicon.ico',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous' as const,
    },
    {
      rel: 'stylesheet',
      href: ARIMO_GOOGLE_FONTS_STYLESHEET,
    },
  ],
  styles: [
    {
      children: ARIMO_FONT_VARIABLE_STYLE,
    },
  ],
})

export const getAppletUmamiHeadScripts = (websiteId?: string) => {
  const umamiScript = getUmamiScriptConfig(websiteId)

  if (!umamiScript) return []

  return [
    {
      defer: true,
      src: umamiScript.src,
      'data-website-id': umamiScript.websiteId,
    },
  ]
}

export const getStaticAppletHead = ({
  title,
  umamiWebsiteId,
}: AppletHeadArgs) => ({
  meta: [
    {
      title,
    },
  ],
  scripts: getAppletUmamiHeadScripts(umamiWebsiteId),
})

export const getHiilikarttaHead = async ({
  locale,
  umamiWebsiteId,
}: HiilikarttaHeadArgs) => {
  const localeNamespaces = getLocaleObj(locale)
  const hiilikarttaStaticData =
    localeNamespaces[HIILIKARTTA_NAMESPACE] || localeNamespaces[DEFAULT_NS]
      ? getStartStaticData({
          ...(localeNamespaces[HIILIKARTTA_NAMESPACE] && {
            [HIILIKARTTA_NAMESPACE]: {
              langs: [locale],
            },
          }),
          ...(localeNamespaces[DEFAULT_NS] && {
            [DEFAULT_NS]: {
              langs: [locale],
            },
          }),
        })
    : {}
  const tolgee = TolgeeBase().init({
    staticData: hiilikarttaStaticData,
    language: locale,
  })
  const title =
    tolgee.t(HIILIKARTTA_METADATA_TITLE_KEY, {
      ns: HIILIKARTTA_NAMESPACE,
      orEmpty: true,
    }) ||
    tolgee.t(HIILIKARTTA_APPLET_TITLE_KEY, {
      ns: DEFAULT_NS,
    })
  const description =
    tolgee.t(HIILIKARTTA_METADATA_DESCRIPTION_KEY, {
      ns: HIILIKARTTA_NAMESPACE,
      orEmpty: true,
    }) ||
    tolgee.t(HIILIKARTTA_APPLET_DESCRIPTION_KEY, {
      ns: DEFAULT_NS,
      orEmpty: true,
    }) || undefined
  const meta = [
    {
      title,
    },
    {
      name: 'application-name',
      content: SITE_NAME,
    },
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:site_name',
      content: SITE_NAME,
    },
    {
      name: 'twitter:card',
      content: 'summary',
    },
    {
      name: 'twitter:title',
      content: title,
    },
  ]

  if (description) {
    meta.push(
      {
        name: 'description',
        content: description,
      },
      {
        property: 'og:description',
        content: description,
      },
      {
        name: 'twitter:description',
        content: description,
      }
    )
  }

  return {
    meta,
    scripts: getAppletUmamiHeadScripts(umamiWebsiteId),
  }
}
