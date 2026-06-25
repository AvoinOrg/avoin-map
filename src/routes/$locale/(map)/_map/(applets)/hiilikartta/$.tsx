import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'
import { normalizeLegacyAppletSubpathSegments } from '#/common/routing/publicRoutes'

const getSplatSegments = (splat: string | undefined) =>
  splat?.split('/').filter(Boolean) ?? []

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/$'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        'carbonmap',
        ...normalizeLegacyAppletSubpathSegments({
          namespace: 'hiilikartta',
          segments: getSplatSegments(params._splat),
        }),
      ],
      location,
    })
  },
})
