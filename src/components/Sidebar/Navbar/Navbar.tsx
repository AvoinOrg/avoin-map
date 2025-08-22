'use client'

import React from 'react'
import { Box } from '@mui/material'

import UserButtons from './UserButtons'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'

export const Navbar = () => {
  return (
    <Box
      className="navbar-container"
      sx={(theme) => ({
        zIndex: theme.zIndex.appBar,
        width: '100%',
        minWidth: '200px',
        height: '100px',
        backgroundColor: theme.palette.primary.dark,
        margin: 'auto 0 0 0',
        bottom: 0,
        border: 1,
        borderColor: theme.palette.primary.dark,
        display: 'flex',
        flexDirection: 'row',
        p: 4,
        pl: SIDEBAR_PADDING_REM + 'rem',
      })}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <UserButtons></UserButtons>
      </Box>
    </Box>
  )
}
