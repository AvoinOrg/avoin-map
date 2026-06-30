import { createFileRoute } from '@tanstack/react-router'

import MainPage from 'applets/main/page'
import {
  AVOIN_MAP_TITLE,
  getStaticAppletHead,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute('/$locale/_map/')({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.MAIN_HOME,
    appletNamespace: 'main',
    variant: 'canonical',
    home: true,
  }),
  head: () =>
    getStaticAppletHead({
      title: AVOIN_MAP_TITLE,
    }),
  component: MainPage,
})
