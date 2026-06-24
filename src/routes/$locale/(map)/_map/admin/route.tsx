import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/runtime/appletRouteGuards'
import { LuonnonmetsakartatVisibleAdminLayout } from '#/runtime/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_ADMIN_TITLE,
} from '#/runtime/headMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/admin')({
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootRoute({
      namespace: 'luonnonmetsakartat',
      locale: params.locale,
      location,
    })
  },
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_ADMIN_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID,
    }),
  component: LuonnonmetsakartatVisibleAdminLayout,
})
