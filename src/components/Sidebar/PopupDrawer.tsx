'use client'

import React from 'react'

import { Box } from '#/common/style/theme/system'

interface Props {
  open: boolean
  children: React.ReactNode
}

const PopupDrawer = ({ open, children }: Props) => {
  return (
    <Box
      className="popup-drawer-container"
      sx={(theme) => ({
        transition: 'width 1s linear',
        zIndex: theme.zIndex.popup,
        width: open ? 'auto' : '0px',
        display: 'flex',
      })}
    >
      {open && children}
    </Box>
  )
}

export default PopupDrawer
