import { Outlet } from '@tanstack/react-router'

import LuonnonmetsakartatAdminGate from './LuonnonmetsakartatAdminGate'

const LuonnonmetsakartatAdminShell = () => {
  return (
    <LuonnonmetsakartatAdminGate>
      <Outlet />
    </LuonnonmetsakartatAdminGate>
  )
}

export default LuonnonmetsakartatAdminShell
