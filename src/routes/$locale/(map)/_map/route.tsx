import { Outlet, createFileRoute } from '@tanstack/react-router'

import MapShell from '#/runtime/MapShell'

const MapLayout = () => (
  <MapShell>
    <Outlet />
  </MapShell>
)

export const Route = createFileRoute('/$locale/(map)/_map')({
  component: MapLayout,
})
