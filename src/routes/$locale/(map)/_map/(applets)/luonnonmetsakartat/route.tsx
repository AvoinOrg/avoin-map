import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/runtime/appletRouteGuards'
import { LuonnonmetsakartatLayout } from '#/runtime/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_TITLE,
} from '#/runtime/headMetadata'

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
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID,
    }),
  component: LuonnonmetsakartatLayout,
})
