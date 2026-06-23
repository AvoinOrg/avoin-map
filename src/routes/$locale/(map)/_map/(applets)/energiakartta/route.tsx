import { Outlet, createFileRoute } from '@tanstack/react-router'

import EnergiakarttaLayoutClient from 'applets/energiakartta/(pages)/layoutClient'

const EnergiakarttaLayout = () => (
  <EnergiakarttaLayoutClient>
    <Outlet />
  </EnergiakarttaLayoutClient>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/energiakartta'
)({
  head: () => ({
    meta: [
      {
        title: 'Energiakartta',
      },
    ],
  }),
  component: EnergiakarttaLayout,
})
