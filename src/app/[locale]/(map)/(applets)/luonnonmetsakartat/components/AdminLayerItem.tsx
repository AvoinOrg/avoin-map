'use client'

import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { EyeClosed, CircleArrowRight, EyeOpen } from '#/components/icons'
import MutableLink from '#/components/common/MutableLink'
import { AdminFolayerConf } from 'applets/luonnonmetsakartat/common/types'
import { routeTree } from 'applets/luonnonmetsakartat/common/routes'
import { useAdminFolayer } from 'applets/luonnonmetsakartat/common/hooks/useAdminFolayer'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'

const AdminLayerItem = ({ conf }: { conf: AdminFolayerConf }) => {
  const [layerGroupStatus, setIsEnabled] = useAdminFolayer(conf.id, {
    preload: true,
  })

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
      <IconButton
        onClick={() =>
          setIsEnabled(layerGroupStatus === 'hidden' ? true : false)
        }
      >
        {layerGroupStatus === 'processing' && (
          <LoadingHorizontal sx={{ width: '24px', height: '24px' }} />
        )}
        {layerGroupStatus === 'hidden' && (
          <EyeClosed sx={{ width: '24px', height: '24px' }} />
        )}
        {layerGroupStatus === 'visible' && (
          <EyeOpen sx={{ width: '24px', height: '24px' }} />
        )}
      </IconButton>
      <Typography
        sx={{ ml: 1, flexGrow: 1, cursor: 'pointer' }}
        onClick={() =>
          setIsEnabled(layerGroupStatus === 'hidden' ? true : false)
        }
      >
        {conf.name}
      </Typography>
      <MutableLink
        route={routeTree.admin.folayer}
        params={{ routeParams: { folayerId: conf.id } }}
        routeTree={routeTree}
      >
        <IconButton>
          <CircleArrowRight sx={{ color: 'black' }} />
        </IconButton>
      </MutableLink>
    </Box>
  )
}

export default AdminLayerItem
