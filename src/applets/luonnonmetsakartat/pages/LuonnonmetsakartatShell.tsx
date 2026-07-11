import { Outlet } from '@tanstack/react-router'

import AppletLayout from '#/components/common/AppletLayout'
import LuonnonmetsakartatAppletRuntime from './LuonnonmetsakartatAppletRuntime'

const LuonnonmetsakartatShell = () => {
  return (
    <AppletLayout
      umamiWebsiteId={
        process.env.PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID
      }
    >
      <LuonnonmetsakartatAppletRuntime>
        <Outlet />
      </LuonnonmetsakartatAppletRuntime>
    </AppletLayout>
  )
}

export default LuonnonmetsakartatShell
