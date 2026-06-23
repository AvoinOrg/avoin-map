import { createFileRoute } from '@tanstack/react-router'

import EnergiakarttaPage from 'applets/energiakartta/(pages)/page'

const EnergiakarttaIndexRoute = () => {
  const { locale } = Route.useParams()

  return <EnergiakarttaPage locale={locale} />
}

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/energiakartta/'
)({
  component: EnergiakarttaIndexRoute,
})
