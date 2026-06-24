import { Outlet } from '@tanstack/react-router'

import MainPage from 'applets/main/page'
import EnergiakarttaLayoutClient from 'applets/energiakartta/pages/layoutClient'
import EnergiakarttaPage from 'applets/energiakartta/pages/page'
import HiilikarttaLayoutClient from 'applets/hiilikartta/pages/layoutClient'
import HiilikarttaPage from 'applets/hiilikartta/pages/page'
import HiilikarttaPlansLayout from 'applets/hiilikartta/pages/kaavat/layout'
import HiilikarttaPlansPage from 'applets/hiilikartta/pages/kaavat/page'
import HiilikarttaPlanLayout from 'applets/hiilikartta/pages/kaavat/plan/layout'
import HiilikarttaPlanPage from 'applets/hiilikartta/pages/kaavat/plan/page'
import HiilikarttaPlanAreasPage from 'applets/hiilikartta/pages/kaavat/plan/alueet/page'
import HiilikarttaReportPage from 'applets/hiilikartta/pages/raportti/page'
import LuonnonmetsakartatLayoutClient from 'applets/luonnonmetsakartat/pages/layoutClient'
import LuonnonmetsakartatPage from 'applets/luonnonmetsakartat/pages/page'
import LuonnonmetsakartatAdminLayoutClient from 'applets/luonnonmetsakartat/pages/admin/layoutClient'
import LuonnonmetsakartatAdminPage from 'applets/luonnonmetsakartat/pages/admin/page'
import LuonnonmetsakartatImportPage from 'applets/luonnonmetsakartat/pages/admin/tuo/page'
import LuonnonmetsakartatFolayerLayoutClient from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/layoutClient'
import LuonnonmetsakartatFolayerPage from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/page'
import LuonnonmetsakartatFolayerSettingsPage from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/asetukset/page'
import LuonnonmetsakartatFolayerPicturesPage from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/kuvat/page'

import { getVisibleAppletRootNamespace } from './appletRouteGuards'

export const EnergiakarttaLayout = () => (
  <EnergiakarttaLayoutClient>
    <Outlet />
  </EnergiakarttaLayoutClient>
)

export const EnergiakarttaApplet = ({ locale }: { locale: string }) => (
  <EnergiakarttaLayoutClient>
    <EnergiakarttaPage locale={locale} />
  </EnergiakarttaLayoutClient>
)

export const EnergiakarttaIndexRoute = ({
  locale,
}: {
  locale: string
}) => <EnergiakarttaPage locale={locale} />

export const HiilikarttaLayout = () => (
  <HiilikarttaLayoutClient>
    <Outlet />
  </HiilikarttaLayoutClient>
)

export const HiilikarttaApplet = () => (
  <HiilikarttaLayoutClient>
    <HiilikarttaPage />
  </HiilikarttaLayoutClient>
)

export const HiilikarttaIndexRoute = () => <HiilikarttaPage />

export const HiilikarttaPlansLayoutRoute = () => (
  <HiilikarttaPlansLayout>
    <Outlet />
  </HiilikarttaPlansLayout>
)

export const HiilikarttaVisiblePlansLayoutRoute = () => (
  <HiilikarttaLayoutClient>
    <HiilikarttaPlansLayout>
      <Outlet />
    </HiilikarttaPlansLayout>
  </HiilikarttaLayoutClient>
)

export const HiilikarttaPlansIndexRoute = () => <HiilikarttaPlansPage />

export const HiilikarttaPlanLayoutRoute = () => (
  <HiilikarttaPlanLayout>
    <Outlet />
  </HiilikarttaPlanLayout>
)

export const HiilikarttaPlanIndexRoute = () => <HiilikarttaPlanPage />

export const HiilikarttaPlanAreasRoute = () => <HiilikarttaPlanAreasPage />

export const HiilikarttaReportRoute = () => <HiilikarttaReportPage />

export const HiilikarttaVisibleReportRoute = () => (
  <HiilikarttaLayoutClient>
    <HiilikarttaReportPage />
  </HiilikarttaLayoutClient>
)

export const LuonnonmetsakartatLayout = () => (
  <LuonnonmetsakartatLayoutClient>
    <Outlet />
  </LuonnonmetsakartatLayoutClient>
)

export const LuonnonmetsakartatApplet = () => (
  <LuonnonmetsakartatLayoutClient>
    <LuonnonmetsakartatPage />
  </LuonnonmetsakartatLayoutClient>
)

export const LuonnonmetsakartatIndexRoute = () => (
  <LuonnonmetsakartatPage />
)

export const LuonnonmetsakartatAdminLayout = () => (
  <LuonnonmetsakartatAdminLayoutClient>
    <Outlet />
  </LuonnonmetsakartatAdminLayoutClient>
)

export const LuonnonmetsakartatVisibleAdminLayout = () => (
  <LuonnonmetsakartatLayoutClient>
    <LuonnonmetsakartatAdminLayoutClient>
      <Outlet />
    </LuonnonmetsakartatAdminLayoutClient>
  </LuonnonmetsakartatLayoutClient>
)

export const LuonnonmetsakartatAdminIndexRoute = () => (
  <LuonnonmetsakartatAdminPage />
)

export const LuonnonmetsakartatImportRoute = () => (
  <LuonnonmetsakartatImportPage />
)

export const LuonnonmetsakartatFolayerLayout = () => (
  <LuonnonmetsakartatFolayerLayoutClient>
    <Outlet />
  </LuonnonmetsakartatFolayerLayoutClient>
)

export const LuonnonmetsakartatFolayerIndexRoute = () => (
  <LuonnonmetsakartatFolayerPage />
)

export const LuonnonmetsakartatFolayerSettingsRoute = () => (
  <LuonnonmetsakartatFolayerSettingsPage />
)

export const LuonnonmetsakartatFolayerPicturesRoute = () => (
  <LuonnonmetsakartatFolayerPicturesPage />
)

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
