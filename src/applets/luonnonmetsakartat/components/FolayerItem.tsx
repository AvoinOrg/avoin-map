'use client'

import React from 'react'

import { LayerToggleRow } from '#/components/common/LayerToggleRow'
import { FolayerConf } from 'applets/luonnonmetsakartat/common/types'
import { useFolayer } from 'applets/luonnonmetsakartat/common/hooks/useFolayer'

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
      rowSx={{
        alignItems: 'center',
        minHeight: { mobile: '2rem', desktop: '1.5rem' },
      }}
      iconSx={{ mr: { mobile: 1.25, desktop: 1 } }}
      labelSx={{
        minWidth: 0,
        overflowWrap: 'break-word',
      }}
    />
  )
}

export default FolayerItem
