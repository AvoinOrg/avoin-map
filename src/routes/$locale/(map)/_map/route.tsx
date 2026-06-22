import { Outlet, createFileRoute } from '@tanstack/react-router'

import StartMapShell from '#/start/StartMapShell'

const MapLayout = () => (
  <StartMapShell>
    <Outlet />
  </StartMapShell>
)

export const Route = createFileRoute('/$locale/(map)/_map')({
  component: MapLayout,
})
