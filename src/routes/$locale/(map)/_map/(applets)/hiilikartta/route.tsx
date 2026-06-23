import { Outlet, createFileRoute } from '@tanstack/react-router'

import HiilikarttaLayoutClient from 'applets/hiilikartta/(pages)/layoutClient'

const HiilikarttaLayout = () => (
  <HiilikarttaLayoutClient>
    <Outlet />
  </HiilikarttaLayoutClient>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta'
)({
  head: () => ({
    meta: [
      {
        title: 'Hiilikartta',
      },
    ],
  }),
  component: HiilikarttaLayout,
})
