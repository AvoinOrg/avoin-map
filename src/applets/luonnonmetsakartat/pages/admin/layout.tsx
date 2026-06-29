import { Outlet } from '@tanstack/react-router'

import LayoutClient from './layoutClient'

const Layout = () => {
  return (
    <LayoutClient>
      <Outlet />
    </LayoutClient>
  )
}

export default Layout
