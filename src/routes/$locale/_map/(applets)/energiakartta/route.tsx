import { createFileRoute } from '@tanstack/react-router'

import {
  getLegacyRouteTailSegments,
  throwLocalizedRouteRedirect,
} from '#/common/routing/legacyRouteRedirects'
import { getPublicAppletRouteSlug } from '#/common/routing/publicRoutes'

const ENERGIAKARTTA_PUBLIC_ROUTE_SLUG =
  getPublicAppletRouteSlug('energiakartta')

export const Route = createFileRoute(
  '/$locale/_map/(applets)/energiakartta'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        ENERGIAKARTTA_PUBLIC_ROUTE_SLUG,
        ...getLegacyRouteTailSegments({
          locale: params.locale,
          location,
          prefixSegments: ['energiakartta'],
        }),
      ],
      location,
    })
  },
})
