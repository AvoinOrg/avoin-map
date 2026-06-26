import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/tuo'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: ['luonnonmetsakartat', 'admin', 'import'],
      location,
    })
  },
})
