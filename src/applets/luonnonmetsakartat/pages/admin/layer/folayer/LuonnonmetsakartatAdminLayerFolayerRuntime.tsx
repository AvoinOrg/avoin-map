'use client'

import React, { useEffect } from 'react'
import { useStore } from 'zustand'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useAdminFolayer } from 'applets/luonnonmetsakartat/common/hooks/useAdminFolayer'
import { getFolayerGroupId } from 'applets/luonnonmetsakartat/common/utils'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'
import { useAppParams } from '#/common/navigation/navigation'

const LuonnonmetsakartatAdminLayerFolayerRuntime = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const params = useAppParams<{ folayerIdSlug: string }>()
  const folayerId = params.folayerIdSlug
  const adminFolayerConf = useStore(
    useAppletStore,
    (state) => state.adminFolayerConfs[folayerId]
  )

  const [isFolayerEnabled, setFolayerEnabled] = useAdminFolayer(folayerId)
  const folayerGroupId = getFolayerGroupId(folayerId, true)
  useExclusiveLayerGroups([folayerGroupId])

  useEffect(() => {
    setFolayerEnabled(true)
  }, [])

  useEffect(() => {
    if (adminFolayerConf) {
      document.title = 'Luonnonmetsakartat / Admin - ' + adminFolayerConf.name
    }
  }, [adminFolayerConf])

  return <>{isFolayerEnabled && adminFolayerConf && children}</>
}

export default LuonnonmetsakartatAdminLayerFolayerRuntime
