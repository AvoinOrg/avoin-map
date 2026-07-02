'use client'

import React from 'react'
import { LayerToggleRowLink } from '#/components/common/LayerToggleRow'
import { AdminFolayerConf } from 'applets/luonnonmetsakartat/common/types'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import { useAdminFolayer } from 'applets/luonnonmetsakartat/common/hooks/useAdminFolayer'

const AdminFolayerItem = ({ conf }: { conf: AdminFolayerConf }) => {
  const [layerGroupStatus, setIsEnabled] = useAdminFolayer(conf.id, {
    preload: true,
  })

  return (
    <LayerToggleRowLink
      label={conf.name}
      status={layerGroupStatus}
      color={conf.colorCode}
      ariaLabel={`Toggle ${conf.name}`}
      onToggle={() => setIsEnabled(layerGroupStatus === 'hidden')}
      sx={{ width: '100%' }}
      rowSx={{
        alignItems: 'center',
        minHeight: { mobile: '2.25rem', desktop: '1.75rem' },
        py: { mobile: '0.125rem', desktop: 0 },
      }}
      iconSx={{ mr: { mobile: 1.25, desktop: 1 } }}
      labelSx={{
        minWidth: 0,
        overflowWrap: 'break-word',
        pr: 0.5,
      }}
      linkSx={{
        ml: { mobile: 1, desktop: 0.75 },
        flexShrink: 0,
      }}
      linkAriaLabel={`Open ${conf.name}`}
      linkProps={{
        routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
        routeParams: { folayerIdSlug: conf.id },
      }}
    />
  )
}

export default AdminFolayerItem
