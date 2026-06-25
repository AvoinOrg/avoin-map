import { createFileRoute } from '@tanstack/react-router'

import { EnergiakarttaIndexRoute } from 'applets/energiakartta/routeComponents'

const EnergiakarttaAppletRouteComponent = () => {
  const { locale } = Route.useParams()

  return <EnergiakarttaIndexRoute locale={locale} />
}

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/energymap/'
)({
  component: EnergiakarttaAppletRouteComponent,
})
