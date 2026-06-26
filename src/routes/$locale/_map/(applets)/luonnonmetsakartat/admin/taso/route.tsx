import { createFileRoute } from '@tanstack/react-router'

import {
  getLegacyRouteTailSegments,
  throwLocalizedRouteRedirect,
} from '#/common/routing/legacyRouteRedirects'
import { normalizeLegacyAppletSubpathSegments } from '#/common/routing/publicRoutes'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/taso'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        'luonnonmetsakartat',
        'admin',
        'layer',
        ...normalizeLegacyAppletSubpathSegments({
          namespace: 'luonnonmetsakartat',
          segments: getLegacyRouteTailSegments({
            locale: params.locale,
            location,
            prefixSegments: ['luonnonmetsakartat', 'admin', 'taso'],
          }),
        }),
      ],
      location,
    })
  },
})
