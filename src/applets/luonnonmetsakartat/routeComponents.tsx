import { Outlet } from '@tanstack/react-router'

import LuonnonmetsakartatAdminLayoutClient from './pages/admin/layoutClient'
import LuonnonmetsakartatAdminPage from './pages/admin/page'
import LuonnonmetsakartatFolayerSettingsPage from './pages/admin/taso/folayer/asetukset/page'
import LuonnonmetsakartatFolayerPicturesPage from './pages/admin/taso/folayer/kuvat/page'
import LuonnonmetsakartatFolayerLayoutClient from './pages/admin/taso/folayer/layoutClient'
import LuonnonmetsakartatFolayerPage from './pages/admin/taso/folayer/page'
import LuonnonmetsakartatImportPage from './pages/admin/tuo/page'
import LuonnonmetsakartatLayoutClient from './pages/layoutClient'
import LuonnonmetsakartatPage from './pages/page'

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
