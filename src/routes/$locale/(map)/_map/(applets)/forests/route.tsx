import { Outlet, createFileRoute } from '@tanstack/react-router'

import ForestsLayoutClient from 'applets/forests/layoutClient'

const ForestsLayout = () => (
  <ForestsLayoutClient>
    <Outlet />
  </ForestsLayoutClient>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/forests'
)({
  component: ForestsLayout,
})
