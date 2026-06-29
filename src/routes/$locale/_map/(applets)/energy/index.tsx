import { createFileRoute } from '@tanstack/react-router'

import EnergiakarttaPage from 'applets/energiakartta/pages/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/energy/'
)({
  component: EnergiakarttaPage,
})
