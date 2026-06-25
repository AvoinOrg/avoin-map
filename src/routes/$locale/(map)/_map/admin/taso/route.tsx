import { createFileRoute } from '@tanstack/react-router'

import {
  getLegacyRouteTailSegments,
  throwLocalizedRouteRedirect,
} from '#/common/routing/legacyRouteRedirects'
import { normalizeLegacyAppletSubpathSegments } from '#/common/routing/publicRoutes'

export const Route = createFileRoute('/$locale/(map)/_map/admin/taso')({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        'admin',
        'layer',
        ...normalizeLegacyAppletSubpathSegments({
          namespace: 'luonnonmetsakartat',
          segments: getLegacyRouteTailSegments({
            locale: params.locale,
            location,
            prefixSegments: ['admin', 'taso'],
          }),
        }),
      ],
      location,
    })
  },
})
