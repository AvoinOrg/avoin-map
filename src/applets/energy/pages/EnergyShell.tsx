import { Outlet } from '@tanstack/react-router'

import AppletLayout from '#/components/common/AppletLayout'
import EnergyAppletRuntime from './EnergyAppletRuntime'

const EnergyShell = () => {
  return (
    <AppletLayout
      umamiWebsiteId={process.env.NEXT_PUBLIC_APPLETS_ENERGIAKARTTA_UMAMI_ID}
    >
      <EnergyAppletRuntime>
        <Outlet />
      </EnergyAppletRuntime>
    </AppletLayout>
  )
}

export default EnergyShell
