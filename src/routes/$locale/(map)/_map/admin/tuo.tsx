import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'

export const Route = createFileRoute('/$locale/(map)/_map/admin/tuo')({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: ['admin', 'import'],
      location,
    })
  },
})
