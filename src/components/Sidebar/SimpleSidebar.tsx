'use client'

import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { Slot } from '../context/slotsContext'
import SidebarToggleButton from './SidebarToggleButton'
import SidebarScaffold from './SidebarScaffold'

export const SimpleSidebar = ({
  sx,
  children,
}: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}) => {
  const breadcrumbArea = (
    <Box
      sx={{
        flexShrink: 0,
        px: { mobile: '1rem', desktop: '1.875rem' },
        pt: { mobile: '1rem', desktop: '1.75rem' },
        pb: { mobile: '0.9rem', desktop: '1rem' },
        color: 'neutral.darker',
        backgroundColor: '#ffffff',
      }}
    >
      <Box
        sx={{
          minHeight: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          typography: 'body2',
        }}
      >
        <Slot name="sidebar-header-children" />
      </Box>
    </Box>
  )

  return (
    <>
      <SidebarToggleButton />
      <SidebarScaffold
        topContent={breadcrumbArea}
        containerSx={[
          {
            pt: 0,
            pb: 0,
            ml: 0,
            width: { mobile: '100vw', desktop: '23.75rem' },
            maxWidth: { mobile: '100vw', desktop: 'min(23.75rem, 100vw)' },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        panelSx={{
          borderRadius: 0,
          backgroundColor: '#ffffff',
        }}
        contentSx={{
          backgroundColor: 'inherit',
        }}
      >
        {children}
      </SidebarScaffold>
    </>
  )
}

export default SimpleSidebar
