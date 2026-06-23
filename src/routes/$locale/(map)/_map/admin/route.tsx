import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/start/appletRouteGuards'
import { LuonnonmetsakartatVisibleAdminLayout } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/admin')({
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootRoute({
      namespace: 'luonnonmetsakartat',
      locale: params.locale,
      location,
    })
  },
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat / Admin',
      },
    ],
  }),
  component: LuonnonmetsakartatVisibleAdminLayout,
})
