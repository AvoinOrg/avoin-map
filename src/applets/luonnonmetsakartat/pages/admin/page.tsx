'use client'

import React, { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Box } from '#/common/style/theme'
import MutableLink from '#/components/common/MutableLink'
import TText from '#/components/common/TText'
import { Upload } from '#/components/icons'
import BigMenuButton from '#/components/common/BigMenuButton'
import { SidebarContentBox } from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'

import AdminFolayerItem from 'applets/luonnonmetsakartat/components/AdminFolayerItem'
import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useAdminFolayersQueryOptions } from 'applets/luonnonmetsakartat/common/queries/adminFolayersQuery'
import { AdminFolayerConf } from 'applets/luonnonmetsakartat/common/types'

const Page = () => {
  const adminFolayerConfs = useAppletStore((state) => state.adminFolayerConfs)

  const { refetch: adminFolayerRefetch, isLoading } = useQuery({
    ...useAdminFolayersQueryOptions(),
    enabled: false,
  })

  const adminFolayerConfsArray: AdminFolayerConf[] = useMemo(() => {
    return Object.values(adminFolayerConfs)
  }, [adminFolayerConfs])

  useEffect(() => {
    adminFolayerRefetch()
  }, [adminFolayerRefetch])

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
          <TText keyName={'sidebar.admin.upload'} ns={'luonnonmetsakartat'} />
          <Upload />
        </BigMenuButton>
      </MutableLink>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <LoadingSpinner />
        </Box>
      )}
      <Box sx={{ ml: '-0.7rem', mr: '-0.5rem' }}>
        {!isLoading && adminFolayerConfsArray.length > 0 && (
          <Box sx={{ width: '100%', mt: 7, pb: 4 }}>
            {adminFolayerConfsArray.map((conf) => (
              <AdminFolayerItem key={conf.id} conf={conf} />
            ))}
          </Box>
        )}
      </Box>

      {/* <Box>
        {isLoading && <LoadingSpinner></LoadingSpinner>}
        {!isLoading && adminFolayerConfsArray.length > 0 && (
          <Box sx={{ width: '100%', mt: 2 }}>
            {adminFolayerConfsArray.map((conf) => (
              <ListItem key={conf.id} disablePadding>
                <MutableLink
                  route={routeTree.admin.folayer}
                  routeParams={{ folayerIdSlug: conf.id }}
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
