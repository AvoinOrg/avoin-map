import { createFileRoute } from '@tanstack/react-router'

import {
  getLegacyRouteTailSegments,
  throwLocalizedRouteRedirect,
} from '#/common/routing/legacyRouteRedirects'
import { normalizeLegacyAppletSubpathSegments } from '#/common/routing/publicRoutes'

export const Route = createFileRoute('/$locale/(map)/_map/kaavat')({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        'plans',
        ...normalizeLegacyAppletSubpathSegments({
          namespace: 'hiilikartta',
          segments: getLegacyRouteTailSegments({
            locale: params.locale,
            location,
            prefixSegments: ['kaavat'],
          }),
        }),
      ],
      location,
    })
  },
})
