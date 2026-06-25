import MainPage from 'applets/main/page'
import { EnergiakarttaApplet } from 'applets/energiakartta/routeComponents'
import { HiilikarttaApplet } from 'applets/hiilikartta/routeComponents'
import { LuonnonmetsakartatApplet } from 'applets/luonnonmetsakartat/routeComponents'

import { getVisibleAppletRootNamespace } from './appletRouteGuards'

export const VisibleAppletRootRoute = ({ locale }: { locale: string }) => {
  const namespace = getVisibleAppletRootNamespace()

  if (namespace === 'energiakartta') {
    return <EnergiakarttaApplet locale={locale} />
  }

  if (namespace === 'hiilikartta') {
    return <HiilikarttaApplet />
  }

  if (namespace === 'luonnonmetsakartat') {
    return <LuonnonmetsakartatApplet />
  }

  return <MainPage />
}
