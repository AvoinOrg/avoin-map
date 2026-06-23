import { createFileRoute } from '@tanstack/react-router'

import {
  getVisibleAppletRootNamespace,
  guardVisibleAppletRootIndexRoute,
} from '#/start/appletRouteGuards'
import { VisibleAppletRootRoute } from '#/start/appletRouteComponents'

const getVisibleRootTitle = () => {
  const namespace = getVisibleAppletRootNamespace()

  if (namespace === 'energiakartta') return 'Energiakartta'
  if (namespace === 'hiilikartta') return 'Hiilikartta'
  if (namespace === 'luonnonmetsakartat') return 'Luonnonmetsakartat'

  return 'Avoin Map'
}

export const Route = createFileRoute('/$locale/(map)/_map/')({
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootIndexRoute({
      locale: params.locale,
      location,
    })
  },
  head: () => ({
    meta: [
      {
        title: getVisibleRootTitle(),
      },
    ],
  }),
  component: () => {
    const { locale } = Route.useParams()

    return <VisibleAppletRootRoute locale={locale} />
  },
})
