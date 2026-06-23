import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/start/appletRouteGuards'
import { HiilikarttaVisibleReportRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/raportti')({
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootRoute({
      namespace: 'hiilikartta',
      locale: params.locale,
      location,
    })
  },
  component: HiilikarttaVisibleReportRoute,
})
