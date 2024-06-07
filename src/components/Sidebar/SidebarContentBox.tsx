'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Box } from '@mui/material'

import {
  SCROLLBAR_WIDTH_REM,
  SIDEBAR_PADDING_REM,
} from '#/common/style/theme/constants'

const SidebarContentBox = ({
  children,
  sx,
}: {
  children: React.ReactNode
  sx?: any
}) => {
  const boxRef = useRef(null)

  return (
    <Box
      ref={boxRef}
      className="sidebar-children-container"
      sx={{
        direction: 'rtl',
        overflowY: 'scroll',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          direction: 'ltr',
          height: '100%',
          overflowY: 'visible',
          p: SIDEBAR_PADDING_REM + 'rem',
          mr: SCROLLBAR_WIDTH_REM + 'rem',
          flex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default SidebarContentBox
