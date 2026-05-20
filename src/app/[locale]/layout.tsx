import React from 'react'
import { Metadata } from 'next'

import LayoutClient from './layoutClient'
import { getStaticData, getLocaleObj } from '#/common/navigation/tolgee/shared'
import { TolgeeNextProvider } from '#/common/navigation/tolgee/client'

type Props = {
  children: React.ReactNode
  params: { locale: string }
  resolvedUrl: string
}

const Layout = async ({ children, params }: Props) => {
  const { locale } = await params
  const locales = await getStaticData(getLocaleObj(locale))

  return (
    <TolgeeNextProvider locale={locale} locales={locales}>
      <LayoutClient locale={locale}>{children}</LayoutClient>
    </TolgeeNextProvider>
  )
}

export default Layout
