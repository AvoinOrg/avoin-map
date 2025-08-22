'use client'

import React, { useEffect, useRef } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { SCROLLBAR_WIDTH_REM, SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
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
          overflowY: 'auto',
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          direction: 'rtl',
          scrollbarGutter: 'stable',
        },
        ...(Array.isArray(sxOuter) ? sxOuter : [sxOuter]),
      ]}
    >
      {/* <OverlayScrollbarsComponent defer
        options={{
          scrollbars: {
            autoHide: 'scroll'
          }
        }}
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
        }}> */}
      <Box
        className="sidebar-children-container-inner"
        sx={[
          {
            direction: 'ltr',
            display: 'flex',
            flexDirection: 'column',
            height: "100%",
            p: SIDEBAR_PADDING_REM + 'rem',
            pl: SIDEBAR_PADDING_REM - SCROLLBAR_WIDTH_REM + 'rem',
          },
          ...(Array.isArray(sxInner) ? sxInner : [sxInner]),
        ]}
      >
        {children}
      </Box>
      {/* </OverlayScrollbarsComponent> */}
    </Box>
  )
}

export default SidebarContentBox
