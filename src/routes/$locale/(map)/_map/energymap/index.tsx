import { createFileRoute } from '@tanstack/react-router'

import { EnergiakarttaIndexRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/energymap/')({
  component: () => {
    const { locale } = Route.useParams()

    return <EnergiakarttaIndexRoute locale={locale} />
  },
})
