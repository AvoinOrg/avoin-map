import React, { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Box } from '#/common/style/theme/system'
import TText from '#/components/common/TText'
import {
  IntoSidebarHeaderSlot,
  SidebarBoundary,
  SidebarContentBox,
} from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'
import { Eco } from '#/components/icons'

import { useAppletStore } from '../state/appletStore'
import { folayersQuery } from '../common/queries/folayersQuery'
import FolayerItem from '../components/FolayerItem'
import type { FolayerConf } from '../common/types'
import { useLuonnonmetsakartatMockScenarioQueryState } from '../common/mockScenarios/queryState'

const SIDEBAR_BOUNDARY_CONFIG = { width: 'compact' } as const

const SIDEBAR_HEADER_IMAGE_SRC =
  '/files/img/luonnonmetsakartat/sidebar/main-hero-header-crop.jpg'

const SIDEBAR_SIDE_PADDING = {
  mobile: '1.5rem',
  desktop: '1.875rem',
}

const SIDEBAR_CONTENT_VERTICAL_PADDING = {
  mobile: '2rem',
  desktop: '2.25rem',
}

const HomeSidebarHeader = () => {
  return (
    <Box
      sx={{
        px: '0.625rem',
        pt: { mobile: '0.625rem', desktop: '0.75rem' },
        pb: { mobile: '0.375rem', desktop: '0.5rem' },
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '6.25rem',
          border: '0.2px solid #ffffff',
          borderRadius: '0.625rem',
          overflow: 'hidden',
          backgroundColor: '#eef5e9',
        }}
      >
        <img
          src={SIDEBAR_HEADER_IMAGE_SRC}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(244, 248, 239, 0.96) 0%, rgba(244, 248, 239, 0.88) 32%, rgba(244, 248, 239, 0.42) 62%, rgba(244, 248, 239, 0) 100%)',
          }}
        />
        <Box
          component="span"
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'block',
            pt: '2.625rem',
            pl: '1.25rem',
            pr: '1rem',
            color: '#111111',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            lineHeight: '1.125rem',
          }}
        >
          Luonnonmetsäkartat
        </Box>
      </Box>
    </Box>
  )
}

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
    <SidebarBoundary
      id="luonnonmetsakartat-public-floating"
      mode="floating"
      config={SIDEBAR_BOUNDARY_CONFIG}
    >
      <IntoSidebarHeaderSlot>
        <HomeSidebarHeader />
      </IntoSidebarHeaderSlot>
      <SidebarContentBox
        sxOuter={{ height: '100%' }}
        scrollbarSide="left"
        sxInner={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={{
            px: SIDEBAR_SIDE_PADDING,
            pt: SIDEBAR_CONTENT_VERTICAL_PADDING,
            pb: SIDEBAR_CONTENT_VERTICAL_PADDING,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          }}
        >
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <LoadingSpinner />
            </Box>
          )}
          {!isLoading && folayerConfsArray.length > 0 && (
            <Box
              sx={{
                width: '100%',
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
            folayerConfsArray.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  mt: 1,
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
                />
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    typography: 'body2',
                    minWidth: 0,
                    overflowWrap: 'break-word',
                  }}
                >
                  <TText
                    ns="luonnonmetsakartat"
                    keyName="sidebar.main.no_data"
                  />
                </Box>
              </Box>
            )}
        </Box>
      </SidebarContentBox>
    </SidebarBoundary>
  )
}

export default LuonnonmetsakartatHomePage
