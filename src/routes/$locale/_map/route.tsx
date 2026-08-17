import { Outlet, createFileRoute } from '@tanstack/react-router'

import MapShell from '#/runtime/ShellComponents/MapShell'

const MapLayout = () => (
  <MapShell>
    <Outlet />
  </MapShell>
)

export const Route = createFileRoute('/$locale/_map')({
  component: MapLayout,
})
