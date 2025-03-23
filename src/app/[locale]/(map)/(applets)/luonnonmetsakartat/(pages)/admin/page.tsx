'use client'

import React, { useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import { T } from '@tolgee/react'

import MutableLink from '#/components/common/MutableLink'
import { Upload } from '#/components/icons'
import BigMenuButton from '#/components/common/BigMenuButton'
import { SidebarContentBox } from '#/components/Sidebar'

import { routeTree } from 'applets/luonnonmetsakartat/common/routes'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useQuery } from '@tanstack/react-query'
import { adminLayersQuery } from 'applets/luonnonmetsakartat/common/queries/adminLayersQuery'
import { LoadingSpinner } from '#/components/Loading'
import { AdminLayerConf } from 'applets/luonnonmetsakartat/common/types'

const Page = () => {
  const adminLayerConfs = useAppletStore((state) => state.adminLayerConfs)

  const { refetch: adminLayerRefetch, isLoading } = useQuery({
    ...adminLayersQuery(),
    enabled: false,
  })

  const adminLayerConfsArray: AdminLayerConf[] = useMemo(() => {
    return Object.values(adminLayerConfs)
  }, [adminLayerConfs])

  useEffect(() => {
    adminLayerRefetch()
  }, [])

  return (
    <SidebarContentBox>
      <MutableLink
        route={routeTree.admin.import}
        routeTree={routeTree}
        sx={{
          display: 'flex',
          color: 'inherit',
          textDecoration: 'none',
          width: '100%',
        }}
      >
        <BigMenuButton color="primary" sx={{ pl: 3, pr: 3 }}>
          <T keyName={'sidebar.admin.upload'} ns={'luonnonmetsakartat'}></T>
          <Upload />
        </BigMenuButton>
      </MutableLink>

      {/* <Box>
        {isLoading && <LoadingSpinner></LoadingSpinner>}
        {!isLoading && adminLayerConfsArray.length > 0 && (
          <Box sx={{ width: '100%', mt: 2 }}>
            {adminLayerConfsArray.map((conf) => (
              <ListItem key={conf.id} disablePadding>
                <MutableLink
                  route={routeTree.admin.layer}
                  routeParams={{ layerIdSlug: conf.id }}
                  routeTree={routeTree}
                  sx={{
                    display: 'flex',
                    color: 'inherit',
                    textDecoration: 'none',
                    width: '100%',
                  }}
                >
                  <ListItemButton>
                    <ListItemText primary={conf.name} />
                  </ListItemButton>
                </MutableLink>
              </ListItem>
            ))}
          </Box>
        )}
      </Box> */}
    </SidebarContentBox>
  )
}

export default Page
