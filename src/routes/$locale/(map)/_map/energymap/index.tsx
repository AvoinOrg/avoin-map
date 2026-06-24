import { createFileRoute } from '@tanstack/react-router'

import { EnergiakarttaIndexRoute } from '#/start/appletRouteComponents'

const EnergyMapRouteComponent = () => {
  const { locale } = Route.useParams()

  return <EnergiakarttaIndexRoute locale={locale} />
}

export const Route = createFileRoute('/$locale/(map)/_map/energymap/')({
  component: EnergyMapRouteComponent,
})
