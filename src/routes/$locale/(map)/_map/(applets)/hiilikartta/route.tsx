import { Outlet, createFileRoute } from '@tanstack/react-router'

const HiilikarttaLayout = () => (
  <section>
    <p>Hiilikartta applet scaffold</p>
    <Outlet />
  </section>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta'
)({
  component: HiilikarttaLayout,
})
