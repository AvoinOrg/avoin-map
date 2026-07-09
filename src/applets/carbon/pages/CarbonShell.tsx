import { Outlet } from '@tanstack/react-router'

import AppletLayout from '#/components/common/AppletLayout'
import CarbonAppletRuntime from './CarbonAppletRuntime'

const CarbonShell = () => {
  return (
    <AppletLayout>
      <CarbonAppletRuntime>
        <Outlet />
      </CarbonAppletRuntime>
    </AppletLayout>
  )
}

export default CarbonShell
