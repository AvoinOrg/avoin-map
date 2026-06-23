import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/start/appletRouteGuards'
import { LuonnonmetsakartatLayout } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat'
)({
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'luonnonmetsakartat',
      locale: params.locale,
      location,
    })
  },
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat',
      },
    ],
  }),
  component: LuonnonmetsakartatLayout,
})
