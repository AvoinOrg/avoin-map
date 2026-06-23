import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/start/appletRouteGuards'
import { LuonnonmetsakartatLayout } from '#/start/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_TITLE,
} from '#/start/headMetadata'

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
