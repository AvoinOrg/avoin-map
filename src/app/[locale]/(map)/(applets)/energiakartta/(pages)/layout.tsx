import { Metadata } from 'next'

import AppletLayout from '#/components/common/AppletLayout'
import LayoutClient from './layoutClient'

export const metadata: Metadata = {
  title: 'Luonnonmetsakartat',
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletLayout
      umamiWebsiteId={process.env.NEXT_PUBLIC_APPLETS_ENERGIAKARTTA_UMAMI_ID}
    >
      <LayoutClient>{children}</LayoutClient>
    </AppletLayout>
  )
}

export default Layout
