'use client'

import React, { useEffect, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { useQuery } from '@tanstack/react-query'

import {
  IntoSidebarHeaderSlot,
  SidebarBoundary,
  SidebarContentBox,
} from '#/components/Sidebar'
import { LoadingSpinner } from '#/components/Loading'

import { useAppletStore } from '../state/appletStore'
import { folayersQuery } from '../common/queries/folayersQuery'
import FolayerItem from '../components/FolayerItem'
import type { FolayerConf } from '../common/types'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'
import { Eco } from '#/components/icons'

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
        px: { mobile: '0.625rem', desktop: '0.625rem' },
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
        <Box
          component="img"
          src={SIDEBAR_HEADER_IMAGE_SRC}
          alt=""
          aria-hidden="true"
          sx={{
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
        <Typography
          sx={{
            position: 'relative',
            zIndex: 1,
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
        </Typography>
      </Box>
    </Box>
  )
}

const Page = () => {
  const folayerConfs = useAppletStore((state) => state.folayerConfs)
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
    folayerRefetch()
  }, [folayerRefetch])

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
        sxOuter={{
          height: '100%',
        }}
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
            <Box sx={{ width: '100%', pb: 4 }}>
              {folayerConfsArray.map((conf) => (
                <FolayerItem key={conf.id} conf={conf} />
              ))}
            </Box>
          )}
          {isFetched && !isLoading && folayerConfsArray.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                mt: 1,
                alignItems: 'flex-start',
              }}
            >
              <Eco
                sx={{ width: 50, height: 'auto', flexShrink: 0, mt: -0.5 }}
              />
              <Typography
                sx={{
                  minWidth: 0,
                  display: 'inline-flex',
                  typography: 'body2',
                  ml: 1.5,
                }}
              >
                <T ns="luonnonmetsakartat" keyName="sidebar.main.no_data" />
              </Typography>
            </Box>
          )}
        </Box>
      </SidebarContentBox>
    </SidebarBoundary>
  )
}

export default Page
