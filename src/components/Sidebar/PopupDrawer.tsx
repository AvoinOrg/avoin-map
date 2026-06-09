'use client'

import React from 'react'

import { Box } from '#/components/common/PandaBox'

interface Props {
  open: boolean
  children: React.ReactNode
}

const PopupDrawer = ({ open, children }: Props) => {
  return (
    <Box
      className="popup-drawer-container"
      sx={{
        transition: 'width 1s linear',
        zIndex: 'popup',
        width: open ? 'auto' : '0px',
        display: 'flex',
      }}
    >
      {open && children}
    </Box>
  )
}

export default PopupDrawer
