'use client'

import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { IntoSlot, Slot } from '#/components/context/slotsContext'

const FULLSCREEN_PAGE_SLOT = 'fullscreen-page'

type FullscreenPageProps = {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export const FullscreenPageSlot = () => {
  return (
    <Box
      className="fullscreen-page-slot"
      sx={(theme) => ({
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal,
        display: 'flex',
        pointerEvents: 'none',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
      })}
    >
      <Slot name={FULLSCREEN_PAGE_SLOT} />
    </Box>
  )
}

export const FullscreenPage = ({ children, sx }: FullscreenPageProps) => {
  return (
    <IntoSlot name={FULLSCREEN_PAGE_SLOT}>
      <Box
        className="fullscreen-page"
        sx={[
          {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            pointerEvents: 'auto',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Box>
    </IntoSlot>
  )
}
