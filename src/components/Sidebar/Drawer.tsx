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

  useEffect(() => {
    setWidth(open ? '100%' : 0)
  }, [open])

  return (
    <Box
      className="drawer-container"
      sx={(theme) => ({
        width: width,
        transition: open ? 'width 0.1s' : 'width 0.1s',
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
