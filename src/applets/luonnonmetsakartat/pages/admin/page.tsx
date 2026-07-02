'use client'

import React, { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Box } from '#/common/style/theme'
import { AppRouteLink } from '#/common/navigation/appRouteLinks'
import TText from '#/components/common/TText'
import { Upload } from '#/components/icons'
import BigMenuButton from '#/components/common/BigMenuButton'
import { SidebarContentBox } from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'

import AdminFolayerItem from 'applets/luonnonmetsakartat/components/AdminFolayerItem'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useAdminFolayersQueryOptions } from 'applets/luonnonmetsakartat/common/queries/adminFolayersQuery'
import { AdminFolayerConf } from 'applets/luonnonmetsakartat/common/types'
import { useLuonnonmetsakartatMockScenarioQueryState } from 'applets/luonnonmetsakartat/common/mockScenarios/queryState'

const Page = () => {
  const adminFolayerConfs = useAppletStore((state) => state.adminFolayerConfs)
  const mockScenarioState = useLuonnonmetsakartatMockScenarioQueryState()
  const isMockScenarioQueryActive = mockScenarioState != null

  const { refetch: adminFolayerRefetch, isLoading } = useQuery({
    ...useAdminFolayersQueryOptions(),
    enabled: false,
  })

  const adminFolayerConfsArray: AdminFolayerConf[] = useMemo(() => {
    return Object.values(adminFolayerConfs)
  }, [adminFolayerConfs])

  useEffect(() => {
    if (isMockScenarioQueryActive) {
      return
    }

    adminFolayerRefetch()
  }, [adminFolayerRefetch, isMockScenarioQueryActive])

  return (
    <SidebarContentBox>
      <AppRouteLink
        routeKey={APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_IMPORT}
        sx={{
          display: 'flex',
          color: 'inherit',
          textDecoration: 'none',
          width: '100%',
        }}
      >
        <BigMenuButton
          color="primary"
          sx={{
            height: 'auto',
            minHeight: '3.75rem',
            px: { mobile: 2, desktop: 3 },
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'left',
          }}
        >
          <Box
            component="span"
            sx={{
              minWidth: 0,
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              lineHeight: 1.2,
            }}
          >
            <TText keyName={'sidebar.admin.upload'} ns={'luonnonmetsakartat'} />
          </Box>
          <Upload
            aria-hidden="true"
            sx={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
          />
        </BigMenuButton>
      </AppRouteLink>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <LoadingSpinner />
        </Box>
      )}
      {!isLoading && adminFolayerConfsArray.length > 0 && (
        <Box
          sx={{
            width: '100%',
            mt: { mobile: '2.25rem', desktop: '2.5rem' },
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: { mobile: 1, desktop: 0.75 },
          }}
        >
          {adminFolayerConfsArray.map((conf) => (
            <AdminFolayerItem key={conf.id} conf={conf} />
          ))}
        </Box>
      )}
    </SidebarContentBox>
  )
}

export default Page
