import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatImportRoute } from '#/runtime/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_IMPORT_TITLE,
} from '#/runtime/headMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/admin/tuo')({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_IMPORT_TITLE,
    }),
  component: LuonnonmetsakartatImportRoute,
})
