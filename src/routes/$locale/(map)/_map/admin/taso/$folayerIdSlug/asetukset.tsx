import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerSettingsRoute } from '#/start/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE,
} from '#/start/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug/asetukset'
)({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE,
    }),
  component: LuonnonmetsakartatFolayerSettingsRoute,
})
