import { Outlet } from '@tanstack/react-router'

import HiilikarttaPlansLayout from './pages/kaavat/layout'
import HiilikarttaPlansPage from './pages/kaavat/page'
import HiilikarttaPlanLayout from './pages/kaavat/plan/layout'
import HiilikarttaPlanPage from './pages/kaavat/plan/page'
import HiilikarttaPlanAreasPage from './pages/kaavat/plan/alueet/page'
import HiilikarttaLayoutClient from './pages/layoutClient'
import HiilikarttaPage from './pages/page'
import HiilikarttaReportPage from './pages/raportti/page'

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

export const HiilikarttaPlansLayoutRoute = HiilikarttaPlansLayout

export const HiilikarttaVisiblePlansLayoutRoute = () => (
  <HiilikarttaLayoutClient>
    <HiilikarttaPlansLayout />
  </HiilikarttaLayoutClient>
)

export const HiilikarttaPlansIndexRoute = () => <HiilikarttaPlansPage />

export const HiilikarttaPlanLayoutRoute = HiilikarttaPlanLayout

export const HiilikarttaPlanIndexRoute = () => <HiilikarttaPlanPage />

export const HiilikarttaPlanAreasRoute = () => <HiilikarttaPlanAreasPage />

export const HiilikarttaReportRoute = () => <HiilikarttaReportPage />

export const HiilikarttaVisibleReportRoute = () => (
  <HiilikarttaLayoutClient>
    <HiilikarttaReportPage />
  </HiilikarttaLayoutClient>
)
