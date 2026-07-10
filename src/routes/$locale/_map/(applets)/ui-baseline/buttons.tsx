import { createFileRoute } from '@tanstack/react-router'

import UiBaselineButtonsTogglesPage from 'applets/ui-baseline/pages/buttons-toggles/UiBaselineButtonsTogglesPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/buttons'
)({
  component: UiBaselineButtonsTogglesPage,
})
