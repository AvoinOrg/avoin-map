import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerSettingsRoute } from '#/runtime/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE,
} from '#/runtime/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug/asetukset'
)({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE,
    }),
  component: LuonnonmetsakartatFolayerSettingsRoute,
})
