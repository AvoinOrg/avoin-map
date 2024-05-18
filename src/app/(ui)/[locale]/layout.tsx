import React from 'react'
import { useRouter } from 'next/router'

import LayoutClient from '../../layoutClient'
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
  // if (!ALL_NS_LANGS.includes(locale)) {
  //   notFound()
  // }
  const router = useRouter()
  const fullPath = router.asPath

  const pathSegments = fullPath.split('/').filter((segment) => segment !== '')
  console.log(locale)
  console.log(pathSegments)
  const nextPart = pathSegments[1] || ''

  const locales = await getStaticData([locale])

  return (
    <TolgeeNextProvider locale={locale} locales={locales}>
      <LayoutClient>{children}</LayoutClient>
    </TolgeeNextProvider>
  )
}

export default Layout
