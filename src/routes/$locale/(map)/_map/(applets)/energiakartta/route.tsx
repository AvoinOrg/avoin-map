import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/runtime/appletRouteGuards'
import { EnergiakarttaLayout } from '#/runtime/appletRouteComponents'
import {
  ENERGIAKARTTA_TITLE,
  getStaticAppletHead,
} from '#/runtime/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/energiakartta'
)({
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'energiakartta',
      locale: params.locale,
      location,
    })
  },
  head: () =>
    getStaticAppletHead({
      title: ENERGIAKARTTA_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_ENERGIAKARTTA_UMAMI_ID,
    }),
  component: EnergiakarttaLayout,
})
