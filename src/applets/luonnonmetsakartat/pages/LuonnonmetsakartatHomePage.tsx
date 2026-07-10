import React, { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Box } from '#/common/style/theme/system'
import TText from '#/components/common/TText'
import { SidebarContentBox } from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'

import { useAppletStore } from '../state/appletStore'
import { folayersQuery } from '../common/queries/folayersQuery'
import FolayerItem from '../components/FolayerItem'
import { FolayerConf } from '../common/types'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'
import { Eco } from '#/components/icons'
import { useLuonnonmetsakartatMockScenarioQueryState } from '../common/mockScenarios/queryState'

const LuonnonmetsakartatHomePage = () => {
  const folayerConfs = useAppletStore((state) => state.folayerConfs)
  const mockScenarioState = useLuonnonmetsakartatMockScenarioQueryState()
  const isMockScenarioQueryActive = mockScenarioState != null
  useExclusiveLayerGroups()

  const {
    refetch: folayerRefetch,
    isLoading,
    isFetched,
  } = useQuery({
    ...folayersQuery(),
    enabled: false,
  })

  const folayerConfsArray: FolayerConf[] = useMemo(() => {
    return Object.values(folayerConfs)
  }, [folayerConfs])

  useEffect(() => {
    if (isMockScenarioQueryActive) {
      return
    }

    folayerRefetch()
  }, [folayerRefetch, isMockScenarioQueryActive])

  return (
    <SidebarContentBox>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <LoadingSpinner />
        </Box>
      )}
      <Box sx={{ width: '100%', minWidth: 0 }}>
        {!isLoading && folayerConfsArray.length > 0 && (
          <Box
            sx={{
              width: '100%',
              mt: { mobile: 5, desktop: 5 },
              pb: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: { mobile: 1, desktop: 0.75 },
            }}
          >
            {folayerConfsArray.map((conf) => (
              <FolayerItem key={conf.id} conf={conf} />
            ))}
          </Box>
        )}
        {(isFetched || isMockScenarioQueryActive) &&
          !isLoading &&
          (!folayerConfsArray || folayerConfsArray.length === 0) && (
            <Box
              sx={{
                display: 'flex',
                mt: { mobile: 5, desktop: 3 },
                alignItems: 'flex-start',
                gap: { mobile: 2, desktop: 1.25 },
                maxWidth: '100%',
              }}
            >
              <Eco
                sx={{
                  width: { mobile: 50, desktop: 42 },
                  height: 'auto',
                  flexShrink: 0,
                }}
              ></Eco>
              <Box
                component="span"
                sx={{
                  display: 'block',
                  typography: 'body2',
                  minWidth: 0,
                  overflowWrap: 'break-word',
                }}
              >
                <TText ns="luonnonmetsakartat" keyName="sidebar.main.no_data" />
              </Box>
            </Box>
          )}
      </Box>
    </SidebarContentBox>
  )
}

export default LuonnonmetsakartatHomePage
