import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/start/appletRouteGuards'
import { EnergiakarttaLayout } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/energymap')({
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'energiakartta',
      locale: params.locale,
      location,
    })
  },
  head: () => ({
    meta: [
      {
        title: 'Energiakartta',
      },
    ],
  }),
  component: EnergiakarttaLayout,
})
