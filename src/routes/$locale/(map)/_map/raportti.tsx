import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/start/appletRouteGuards'
import { HiilikarttaVisibleReportRoute } from '#/start/appletRouteComponents'
import { getHiilikarttaHead } from '#/start/headMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/raportti')({
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootRoute({
      namespace: 'hiilikartta',
      locale: params.locale,
      location,
    })
  },
  head: ({ params }) =>
    getHiilikarttaHead({
      locale: params.locale,
      umamiWebsiteId: process.env.NEXT_PUBLIC_APPLETS_HIILIKARTTA_UMAMI_ID,
    }),
  component: HiilikarttaVisibleReportRoute,
})
