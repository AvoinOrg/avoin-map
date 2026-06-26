import { createFileRoute } from '@tanstack/react-router'

import {
  getLegacyRouteTailSegments,
  throwLocalizedRouteRedirect,
} from '#/common/routing/legacyRouteRedirects'
import {
  getPublicAppletRouteSlug,
  normalizeLegacyAppletSubpathSegments,
} from '#/common/routing/publicRoutes'

const HIILIKARTTA_PUBLIC_ROUTE_SLUG = getPublicAppletRouteSlug('hiilikartta')

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        HIILIKARTTA_PUBLIC_ROUTE_SLUG,
        ...normalizeLegacyAppletSubpathSegments({
          namespace: 'hiilikartta',
          segments: getLegacyRouteTailSegments({
            locale: params.locale,
            location,
            prefixSegments: ['hiilikartta'],
          }),
        }),
      ],
      location,
    })
  },
})
