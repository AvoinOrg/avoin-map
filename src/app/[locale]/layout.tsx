import React from 'react'

import LayoutClient from './layoutClient'
import { getStaticData, getLocaleObj } from '#/common/navigation/tolgee/shared'
import { TolgeeNextProvider } from '#/common/navigation/tolgee/client'

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
}: Props) => {
  const locales = await getStaticData(getLocaleObj(locale))

  return (
    <TolgeeNextProvider locale={locale} locales={locales}>
      <LayoutClient>{children}</LayoutClient>
    </TolgeeNextProvider>
  )
}

export default Layout
