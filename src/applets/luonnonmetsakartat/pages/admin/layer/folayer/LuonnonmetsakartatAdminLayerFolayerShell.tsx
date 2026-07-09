import { Outlet } from '@tanstack/react-router'

import LuonnonmetsakartatAdminLayerFolayerRuntime from './LuonnonmetsakartatAdminLayerFolayerRuntime'

const LuonnonmetsakartatAdminLayerFolayerShell = () => {
  return (
    <LuonnonmetsakartatAdminLayerFolayerRuntime>
      <Outlet />
    </LuonnonmetsakartatAdminLayerFolayerRuntime>
  )
}

export default LuonnonmetsakartatAdminLayerFolayerShell
