import { Outlet } from '@tanstack/react-router'

import EnergiakarttaLayoutClient from './pages/layoutClient'
import EnergiakarttaPage from './pages/page'

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
