import { Outlet } from '@tanstack/react-router'

import AppletLayout from '#/components/common/AppletLayout'
import UiBaselineAppletRuntime from './UiBaselineAppletRuntime'

const UiBaselineShell = () => {
  return (
    <AppletLayout>
      <UiBaselineAppletRuntime>
        <Outlet />
      </UiBaselineAppletRuntime>
    </AppletLayout>
  )
}

export default UiBaselineShell
