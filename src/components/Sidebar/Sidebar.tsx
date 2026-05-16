'use client'

import React from 'react'
import type { SxProps, Theme } from '@mui/material'

import FloatingSidebar from './FloatingSidebar'

export const Sidebar = ({
  sx,
  children,
}: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}) => <FloatingSidebar sx={sx}>{children}</FloatingSidebar>

export default Sidebar
