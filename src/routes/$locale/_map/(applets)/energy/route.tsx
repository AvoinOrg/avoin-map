import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/runtime/appletRouteGuards'
import EnergiakarttaLayout from 'applets/energy/pages/layout'
import {
  ENERGIAKARTTA_TITLE,
  getStaticAppletHead,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
  publicRouteConfig,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/energy'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.ENERGY_HOME,
    appletNamespace: 'energy',
    variant: 'canonical',
    home: true,
    title: routeTextKey('energiakartta', 'sidebar.title'),
    breadcrumb: routeTextKey('energiakartta', 'sidebar.title'),
    public: publicRouteConfig({
      slug: 'energy',
    }),
  }),
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'energy',
      locale: params.locale,
      location,
    })
  },
  head: () =>
    getStaticAppletHead({
      title: ENERGIAKARTTA_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_ENERGIAKARTTA_UMAMI_ID,
    }),
  component: EnergiakarttaLayout,
})
