import { Outlet, createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlanLayout from 'applets/hiilikartta/(pages)/kaavat/[planId]/layout'

const HiilikarttaPlanRouteLayout = () => (
  <HiilikarttaPlanLayout>
    <Outlet />
  </HiilikarttaPlanLayout>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId'
)({
  component: HiilikarttaPlanRouteLayout,
})
