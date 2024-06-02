import React from 'react'
import { redirect } from 'next/navigation'

import LayoutClient from './layoutClient'
import {
  getStaticData,
  DEFAULT_LOCALE,
  getLocaleObj,
  getLocalesForNs,
  ALL_NS_LANGS,
} from '#/common/tolgee/shared'
import { TolgeeNextProvider } from '#/common/tolgee/client'
import { pathnames } from '#/components/Navigation'

type Props = {
  children: React.ReactNode
  params: { locale: string }
  resolvedUrl: string
}

const Layout = async ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params: { locale },
  resolvedUrl,
}: Props) => {
  // const locales = await getStaticData([locale])

  let localeObj = getLocaleObj(locale)
  const localeExists = Object.keys(localeObj).length > 0
  const splitUrl = resolvedUrl.split('/').filter((path) => path !== '')

  if (!localeExists || splitUrl.length > 1) {
    let matchedPath = null

    // the index of the part of the url that is used for pattern matching
    // i.e., the part after locale. Or if locale is not found, the first part
    let urlIndex = 0
    if (localeExists && splitUrl.length > 1) {
      urlIndex = 1
    }

    matchedPath = Object.values(pathnames).find((pathname) => {
      const splitPathname = pathname.split('/').filter((path) => path !== '')
      if (splitPathname.length > 0) {
        return (
          splitPathname[0].toLowerCase() === splitUrl[urlIndex].toLowerCase()
        )
      }
    })

    // if the path is legit
    if (matchedPath) {
      if (Object.keys(ALL_NS_LANGS).includes(matchedPath)) {
        let appletLocale = locale
        if (!localeExists) {
          appletLocale = DEFAULT_LOCALE
        }
        const appletPath = matchedPath as keyof typeof ALL_NS_LANGS
        const localesForNs = getLocalesForNs(appletPath)
        if (localesForNs.includes(locale)) {
          if (!localeExists) {
            // redirect to the global default locale
            redirect(`/${appletLocale}/${resolvedUrl}`)
          }
        } else {
          appletLocale = localesForNs[0]

          // redirect to default (first) locale for the applet
          redirect(`/${appletLocale}/${resolvedUrl}`)
        }
      }
    }

    if (!localeExists) {
      // redirect to the global default locale
      redirect(`/${DEFAULT_LOCALE}/${resolvedUrl}`)
    }
  }

  const locales = await getStaticData(getLocaleObj(locale))

  return (
    <TolgeeNextProvider locale={locale} locales={locales}>
      <LayoutClient>{children}</LayoutClient>
    </TolgeeNextProvider>
  )
}

export default Layout
