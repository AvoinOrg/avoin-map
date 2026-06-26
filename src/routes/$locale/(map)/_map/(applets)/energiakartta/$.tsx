import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'
import { getPublicAppletRouteSlug } from '#/common/routing/publicRoutes'

const getSplatSegments = (splat: string | undefined) =>
  splat?.split('/').filter(Boolean) ?? []
const ENERGIAKARTTA_PUBLIC_ROUTE_SLUG =
  getPublicAppletRouteSlug('energiakartta')

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/energiakartta/$'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        ENERGIAKARTTA_PUBLIC_ROUTE_SLUG,
        ...getSplatSegments(params._splat),
      ],
      location,
    })
  },
})
