import React from 'react'

import { notFound } from 'next/navigation'
import LayoutClient from './layoutClient'
import { ALL_NS_LANGS, getStaticData } from '#/common/tolgee/shared'
import { TolgeeNextProvider } from '#/common/tolgee/client'

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

const Layout = async ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params: { locale },
}: Props) => {
  // const locales = await getStaticData([locale])
  const getLocaleObj = (locale: string) => {
    const locales: Record<string, { langs: string[] }> = {}
    for (const ns of Object.keys(ALL_NS_LANGS)) {
      // @ts-ignore
      if (ALL_NS_LANGS[ns].langs.includes(locale)) {
        locales[ns] = { langs: [locale] }
      }
    }
    return locales
  }

  const localeObj = getLocaleObj(locale)

  if (Object.keys(localeObj).length === 0) {
    notFound()
  }

  const locales = await getStaticData(getLocaleObj(locale))

  return (
    <TolgeeNextProvider locale={locale} locales={locales}>
      <LayoutClient>{children}</LayoutClient>
    </TolgeeNextProvider>
  )
}

export default Layout
