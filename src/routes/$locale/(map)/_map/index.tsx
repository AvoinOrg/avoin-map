import { createFileRoute } from '@tanstack/react-router'

import {
  getVisibleAppletRootNamespace,
  guardVisibleAppletRootIndexRoute,
} from '#/runtime/appletRouteGuards'
import { VisibleAppletRootRoute } from '#/runtime/appletRouteComponents'
import {
  AVOIN_MAP_TITLE,
  ENERGIAKARTTA_TITLE,
  getHiilikarttaHead,
  getStaticAppletHead,
  LUONNONMETSAKARTAT_TITLE,
} from '#/runtime/headMetadata'

const getVisibleRootHead = (locale: string) => {
  const namespace = getVisibleAppletRootNamespace()

  if (namespace === 'energiakartta') {
    return getStaticAppletHead({
      title: ENERGIAKARTTA_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_ENERGIAKARTTA_UMAMI_ID,
    })
  }

  if (namespace === 'hiilikartta') {
    return getHiilikarttaHead({
      locale,
      umamiWebsiteId: process.env.NEXT_PUBLIC_APPLETS_HIILIKARTTA_UMAMI_ID,
    })
  }

  if (namespace === 'luonnonmetsakartat') {
    return getStaticAppletHead({
      title: LUONNONMETSAKARTAT_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID,
    })
  }

  return getStaticAppletHead({
    title: AVOIN_MAP_TITLE,
  })
}

const VisibleAppletRootComponent = () => {
  const { locale } = Route.useParams()

  return <VisibleAppletRootRoute locale={locale} />
}

export const Route = createFileRoute('/$locale/(map)/_map/')({
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootIndexRoute({
      locale: params.locale,
      location,
    })
  },
  head: ({ params }) => getVisibleRootHead(params.locale),
  component: VisibleAppletRootComponent,
})
