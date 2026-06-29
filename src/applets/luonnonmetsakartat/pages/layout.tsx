import { Outlet } from '@tanstack/react-router'

import AppletLayout from '#/components/common/AppletLayout'
import LayoutClient from './layoutClient'

const Layout = () => {
  return (
    <AppletLayout
      umamiWebsiteId={
        process.env.NEXT_PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID
      }
    >
      <LayoutClient>
        <Outlet />
      </LayoutClient>
    </AppletLayout>
  )
}

export default Layout
