import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/start/appletRouteGuards'
import { EnergiakarttaLayout } from '#/start/appletRouteComponents'
import {
  ENERGIAKARTTA_TITLE,
  getStaticAppletHead,
} from '#/start/headMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/energymap')({
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'energiakartta',
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
