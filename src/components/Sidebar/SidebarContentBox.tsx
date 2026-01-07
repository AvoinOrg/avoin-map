'use client'

import React, { use } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import {
  MOBILE_SIDEBAR_PADDING_REM,
  SIDEBAR_PADDING_REM,
} from '#/common/style/theme/constants'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

const SidebarContentBox = ({
  sxOuter,
  sxInner,
  children,
}: {
  sxOuter?: SxProps<Theme>
  sxInner?: SxProps<Theme>
  children?: React.ReactNode
}) => {
  const isMobile = useIsMobile()

  return (
    <Box
      className="sidebar-children-container"
      sx={[
        {
          flexDirection: 'column',
          height: '100%',
          flexGrow: '1',
          minWidth: isMobile ? '100%' : '0',
          display: 'flex',
          minHeight: 0,
          maxWidth: '100%',
        },
        ...(Array.isArray(sxOuter) ? sxOuter : [sxOuter]),
      ]}
    >
      <OverlayScrollbarsComponent
        className="osScroll"
        options={{
          overflow: { x: 'hidden', y: 'scroll' },
          scrollbars: {
            theme: 'os-theme-dark',
            autoHide: 'leave',
            autoHideDelay: 600,
          },
        }}
        style={{ flex: 1, minHeight: 0, height: '100%' }}
      >
        <Box
          className="sidebar-children-container-inner"
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
              flex: 1,
              p: SIDEBAR_PADDING_REM + 'rem',
              px: isMobile
                ? MOBILE_SIDEBAR_PADDING_REM + 'rem'
                : SIDEBAR_PADDING_REM + 'rem',
            },
            ...(Array.isArray(sxInner) ? sxInner : [sxInner]),
          ]}
        >
          {children}
        </Box>
      </OverlayScrollbarsComponent>
    </Box>
  )
}

export default SidebarContentBox
