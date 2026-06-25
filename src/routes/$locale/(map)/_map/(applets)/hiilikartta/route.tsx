import { createFileRoute } from '@tanstack/react-router'

import {
  getLegacyRouteTailSegments,
  throwLocalizedRouteRedirect,
} from '#/common/routing/legacyRouteRedirects'
import { normalizeLegacyAppletSubpathSegments } from '#/common/routing/publicRoutes'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        'carbonmap',
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
