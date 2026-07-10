import { createFileRoute } from '@tanstack/react-router'

import UiBaselineHomePage from 'applets/ui-baseline/pages/UiBaselineHomePage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/'
)({
  component: UiBaselineHomePage,
})
