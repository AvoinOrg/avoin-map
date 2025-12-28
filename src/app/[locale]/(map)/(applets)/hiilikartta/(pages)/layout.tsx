import { Metadata } from 'next'

import AppletLayout from '#/components/common/AppletLayout'
import LayoutClient from './layoutClient'

export const metadata: Metadata = {
  title: 'Hiilikartta',
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
