import { Outlet, createFileRoute } from '@tanstack/react-router'

const MapLayout = () => (
  <section>
    <p>Shared map shell scaffold</p>
    <Outlet />
  </section>
)

export const Route = createFileRoute('/$locale/(map)/_map')({
  component: MapLayout,
})
