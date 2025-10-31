'use client'

import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { EyeClosed, CircleArrowRight, EyeOpen } from '#/components/icons'
import { getContrastColor } from '#/common/utils/styling'
import MutableLink from '#/components/common/MutableLink'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'

import { FolayerConf } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import { useFolayer } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/hooks/useFolayer'

const FolayerItem = ({ conf }: { conf: FolayerConf }) => {
  const [layerGroupStatus, setIsEnabled] = useFolayer(conf.id, {
    preload: true,
  })

  const contrastColor = getContrastColor(conf.colorCode)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
      <IconButton
        onClick={() =>
          setIsEnabled(layerGroupStatus === 'hidden' ? true : false)
        }
      >
        {layerGroupStatus === 'processing' && (
          <Box
            sx={{
              width: '32px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LoadingHorizontal sx={{ width: '24px', height: '24px' }} />
          </Box>
        )}
        {layerGroupStatus === 'hidden' && (
          <Box
            sx={{
              width: '32px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EyeClosed sx={{ width: '24px', height: '24px' }} />
          </Box>
        )}
        {layerGroupStatus === 'visible' && (
          <Box
            sx={{
              width: 32,
              height: 24,
              borderRadius: '50%',
              background: conf.colorCode,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: contrastColor,
            }}
          >
            <EyeOpen
              sx={{
                width: 24,
                height: 24,
                color: contrastColor,
              }}
            />
          </Box>
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
      {/* <MutableLink
        route={routeTree.admin.folayer}
        params={{ routeParams: { folayerId: conf.id } }}
        routeTree={routeTree}
      >
        <IconButton>
          <CircleArrowRight sx={{ color: 'black' }} />
        </IconButton>
      </MutableLink> */}
    </Box>
  )
}

export default FolayerItem
