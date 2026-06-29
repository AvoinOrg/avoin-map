import { Outlet } from '@tanstack/react-router'

import AppletLayout from '#/components/common/AppletLayout'
import LayoutClient from './layoutClient'

const Layout = () => {
  return (
    <AppletLayout>
      <LayoutClient>
        <Outlet />
      </LayoutClient>
    </AppletLayout>
  )
}

export default Layout
