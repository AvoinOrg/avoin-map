'use client'

import React from 'react'

import { LayerToggleRow } from '#/components/common/LayerToggleRow'
import { FolayerConf } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { useFolayer } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/hooks/useFolayer'

const FolayerItem = ({ conf }: { conf: FolayerConf }) => {
  const [layerGroupStatus, setIsEnabled] = useFolayer(conf.id, {
    preload: true,
  })

  return (
    <LayerToggleRow
      label={conf.name}
      status={layerGroupStatus}
      color={conf.colorCode}
      ariaLabel={`Toggle ${conf.name}`}
      onToggle={() => setIsEnabled(layerGroupStatus === 'hidden')}
      sx={{ mb: 1 }}
      labelSx={{ ml: 1 }}
    />
  )
}

export default FolayerItem
