'use client'

import React from 'react'
import { LayerToggleRowLink } from '#/components/common/LayerToggleRow'
import { AdminFolayerConf } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import { useAdminFolayer } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/hooks/useAdminFolayer'

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
      sx={{ mb: 1 }}
      labelSx={{ ml: 1 }}
      linkAriaLabel={`Open ${conf.name}`}
      linkProps={{
        route: routeTree.admin.folayer,
        params: { routeParams: { folayerId: conf.id } },
        routeTree,
      }}
    />
  )
}

export default AdminFolayerItem
