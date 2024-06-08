'use client'

import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'

import { SIDEBAR_CLOSED_WIDTH } from '#/common/style/theme/constants'

interface Props {
  open: boolean
  children: React.ReactNode
}

const Drawer = ({ open, children }: Props) => {
  const [width, setWidth] = useState(open ? '100%' : 0)
  const [opacity, setOpacity] = useState(open ? 1 : 0)

  useEffect(() => {
    setWidth(open ? '100%' : 0)
    setOpacity(open ? 1 : 0)
  }, [open])

  return (
    <Box
      className="drawer-container"
      sx={(theme) => ({
        width: width,
        opacity: opacity,
        transition: open
          ? 'opacity 0.2s ease-in-out, width 0.1s ease-in-out'
          : 'opacity 0.1s ease-in-out, width 0.2s ease-in-out',
        zIndex: theme.zIndex.drawer,
        overflowY: open ? 'visible' : 'hidden', // Allow overflow vertically when open
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Hide overflowing content
        border: 1,
        borderColor: 'primary.dark',
        whiteSpace: open ? 'normal' : 'nowrap',
      })}
    >
      {children}
    </Box>
  )
}

export default Drawer
