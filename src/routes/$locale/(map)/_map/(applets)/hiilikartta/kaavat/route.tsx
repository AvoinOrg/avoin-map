import { Outlet, createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlansLayout from 'applets/hiilikartta/(pages)/kaavat/layout'

const HiilikarttaKaavatLayout = () => (
  <HiilikarttaPlansLayout>
    <Outlet />
  </HiilikarttaPlansLayout>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat'
)({
  component: HiilikarttaKaavatLayout,
})
