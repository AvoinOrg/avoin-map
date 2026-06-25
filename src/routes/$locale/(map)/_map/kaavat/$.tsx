import { createFileRoute } from '@tanstack/react-router'

import { throwLocalizedRouteRedirect } from '#/common/routing/legacyRouteRedirects'
import { normalizeLegacyAppletSubpathSegments } from '#/common/routing/publicRoutes'

const getSplatSegments = (splat: string | undefined) =>
  splat?.split('/').filter(Boolean) ?? []

export const Route = createFileRoute('/$locale/(map)/_map/kaavat/$')({
  beforeLoad: ({ params, location }) => {
    throwLocalizedRouteRedirect({
      locale: params.locale,
      segments: [
        'plans',
        ...normalizeLegacyAppletSubpathSegments({
          namespace: 'hiilikartta',
          segments: getSplatSegments(params._splat),
        }),
      ],
      location,
    })
  },
})
