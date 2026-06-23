import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/start/appletRouteGuards'
import { HiilikarttaLayout } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta'
)({
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'hiilikartta',
      locale: params.locale,
      location,
    })
  },
  head: () => ({
    meta: [
      {
        title: 'Hiilikartta',
      },
    ],
  }),
  component: HiilikarttaLayout,
})
