'use client'

import React, { useEffect } from 'react'
import { useStore } from 'zustand'
import { useParams } from 'next/navigation'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { useAdminFolayer } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/hooks/useAdminFolayer'
import { getFolayerGroupId } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/utils'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const params = useParams()
  const folayerId = params.folayerIdSlug as string
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

export default LayoutClient
