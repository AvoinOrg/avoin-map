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
  children: React.ReactNode
}) => {
  return (
    <Box
      className="sidebar-children-container"
      sx={[
        {
          overflowY: 'auto',
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          direction: 'rtl',
        },
        ...(Array.isArray(sxOuter) ? sxOuter : [sxOuter]),
      ]}
    >
      <OverlayScrollbarsComponent defer>
        <Box
          sx={[
            {
              direction: 'ltr',
              // display: 'flex',
              // flexDirection: 'column',
              // flex: 1,
              p: SIDEBAR_PADDING_REM + 'rem',
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
