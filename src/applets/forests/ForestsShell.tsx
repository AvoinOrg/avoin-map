import { Outlet } from '@tanstack/react-router'

import AppletLayout from '#/components/common/AppletLayout'
import ForestsAppletRuntime from './ForestsAppletRuntime'

const ForestsShell = () => {
  return (
    <AppletLayout>
      <ForestsAppletRuntime>
        <Outlet />
      </ForestsAppletRuntime>
    </AppletLayout>
  )
}

export default ForestsShell
