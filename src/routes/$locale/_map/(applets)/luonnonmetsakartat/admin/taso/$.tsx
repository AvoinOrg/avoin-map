import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'
import { normalizeLegacyAppletSubpathSegments } from '#/common/routing/publicRoutes'

const getSplatSegments = (splat: string | undefined) =>
  splat?.split('/').filter(Boolean) ?? []

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/taso/$'
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
          segments: getSplatSegments(params._splat),
        }),
      ],
      location,
    })
  },
})
