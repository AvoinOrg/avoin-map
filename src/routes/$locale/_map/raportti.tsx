import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'

export const Route = createFileRoute('/$locale/_map/raportti')({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: ['report'],
      location,
    })
  },
})
