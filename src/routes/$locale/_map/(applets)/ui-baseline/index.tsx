import { createFileRoute } from '@tanstack/react-router'

import UiBaselinePage from 'applets/ui-baseline/pages/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/'
)({
  component: UiBaselinePage,
})
