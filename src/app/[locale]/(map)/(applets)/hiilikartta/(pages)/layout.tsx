import type { Metadata } from 'next'

import AppletLayout from '#/components/common/AppletLayout'
import {
  DEFAULT_LOCALE,
  getStaticData,
  TolgeeBase,
} from '#/common/navigation/tolgee/shared'
import LayoutClient from './layoutClient'

const SITE_NAME = 'Avoin Map'
const FALLBACK_TITLE = 'Hiilikartta'

type MetadataProps = {
  params: {
    locale: string
  }
}

export const generateMetadata = async ({
  params,
}: MetadataProps): Promise<Metadata> => {
  const { locale } = await params
  const resolvedLocale = locale ?? DEFAULT_LOCALE
  const staticData = await getStaticData({
    hiilikartta: {
      langs: [resolvedLocale],
    },
  })
  const tolgee = TolgeeBase().init({
    staticData,
    language: resolvedLocale,
  })
  const title = tolgee.t('meta.title', FALLBACK_TITLE, {
    ns: 'hiilikartta',
  })
  const description =
    tolgee.t('meta.description', {
      ns: 'hiilikartta',
      orEmpty: true,
    }) || undefined

  return {
    title,
    description,
    applicationName: SITE_NAME,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletLayout
      umamiWebsiteId={process.env.NEXT_PUBLIC_APPLETS_HIILIKARTTA_UMAMI_ID}
    >
      <LayoutClient>{children}</LayoutClient>
    </AppletLayout>
  )
}

export default Layout
