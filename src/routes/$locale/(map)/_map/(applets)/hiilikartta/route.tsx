import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/runtime/appletRouteGuards'
import { HiilikarttaLayout } from '#/runtime/appletRouteComponents'
import { getHiilikarttaHead } from '#/runtime/headMetadata'

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
  head: ({ params }) =>
    getHiilikarttaHead({
      locale: params.locale,
      umamiWebsiteId: process.env.NEXT_PUBLIC_APPLETS_HIILIKARTTA_UMAMI_ID,
    }),
  component: HiilikarttaLayout,
})
