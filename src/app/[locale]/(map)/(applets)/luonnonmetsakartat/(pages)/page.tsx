'use client'

import React, { useEffect, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { useQuery } from '@tanstack/react-query'

import { SidebarContentBox } from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'

import { routeTree } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/routes'
import { useAppletStore } from '../state/appletStore'
import { folayersQuery } from '../common/queries/folayersQuery'
import FolayerItem from '../components/FolayerItem'
import { FolayerConf } from '../common/types'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'

const Page = () => {
  const folayerConfs = useAppletStore((state) => state.folayerConfs)
  useExclusiveLayerGroups()

  const { refetch: folayerRefetch, isLoading } = useQuery({
    ...folayersQuery(),
    enabled: false,
  })

  const folayerConfsArray: FolayerConf[] = useMemo(() => {
    return Object.values(folayerConfs)
  }, [folayerConfs])

  useEffect(() => {
    folayerRefetch()
  }, [])

  return (
    <SidebarContentBox>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <LoadingSpinner />
        </Box>
      )}
      {!isLoading && folayerConfsArray.length > 0 && (
        <Box sx={{ width: '100%', mt: 5, pb: 4 }}>
          {folayerConfsArray.map((conf) => (
            <FolayerItem key={conf.id} conf={conf} />
          ))}
        </Box>
      )}
    </SidebarContentBox>
  )
}

export default Page
