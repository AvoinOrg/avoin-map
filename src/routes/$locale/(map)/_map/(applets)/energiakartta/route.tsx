import { createFileRoute } from '@tanstack/react-router'

import {
  getLegacyRouteTailSegments,
  throwLocalizedRouteRedirect,
} from '#/common/routing/legacyRouteRedirects'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/energiakartta'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        'energymap',
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
