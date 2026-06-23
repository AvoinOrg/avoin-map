import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/start/appletRouteGuards'
import { HiilikarttaVisiblePlansLayoutRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/kaavat')({
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootRoute({
      namespace: 'hiilikartta',
      locale: params.locale,
      location,
    })
  },
  component: HiilikarttaVisiblePlansLayoutRoute,
})
