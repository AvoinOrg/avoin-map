import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatImportRoute } from '#/start/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_IMPORT_TITLE,
} from '#/start/headMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/admin/tuo')({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_IMPORT_TITLE,
    }),
  component: LuonnonmetsakartatImportRoute,
})
