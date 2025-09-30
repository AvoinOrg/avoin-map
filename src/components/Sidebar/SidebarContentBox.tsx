'use client'

import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
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
  return (
    <Box
      className="sidebar-children-container"
      sx={[
        {
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          display: 'flex',
          minHeight: 0,
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
        style={{ flex: 1, minHeight: 0 }}
      >
        <Box
          className="sidebar-children-container-inner"
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: '100%',
              p: SIDEBAR_PADDING_REM + 'rem',
              pl: SIDEBAR_PADDING_REM + 'rem',
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
