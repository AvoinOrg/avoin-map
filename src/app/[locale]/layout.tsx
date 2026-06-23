import React from 'react'

import LayoutClient from './layoutClient'
import { getStaticData, getLocaleObj } from '#/common/navigation/tolgee/shared'
import { TolgeeAppProvider } from '#/common/navigation/tolgee/client'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const Layout = async ({ children, params }: Props) => {
  const { locale } = await params
  const staticData = await getStaticData(getLocaleObj(locale))

  return (
    <TolgeeAppProvider locale={locale} staticData={staticData}>
      <LayoutClient locale={locale}>{children}</LayoutClient>
    </TolgeeAppProvider>
  )
}

export default Layout
