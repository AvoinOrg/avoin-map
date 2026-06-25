import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'

const getSplatSegments = (splat: string | undefined) =>
  splat?.split('/').filter(Boolean) ?? []

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/energiakartta/$'
)({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: ['energymap', ...getSplatSegments(params._splat)],
      location,
    })
  },
})
