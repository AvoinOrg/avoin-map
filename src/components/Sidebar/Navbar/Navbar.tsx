'use client'

import React from 'react'

import { Box } from '#/components/common/PandaBox'
import UserButtons from './UserButtons'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'

export const Navbar = () => {
  return (
    <Box
      className="navbar-container"
      sx={{
        zIndex: 'appBar',
        width: '100%',
        minWidth: '200px',
        height: '100px',
        backgroundColor: 'primary.dark',
        margin: 'auto 0 0 0',
        bottom: 0,
        border: '1px solid',
        borderColor: 'primary.dark',
        display: 'flex',
        flexDirection: 'row',
        p: 4,
        pl: SIDEBAR_PADDING_REM + 'rem',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <UserButtons></UserButtons>
      </Box>
    </Box>
  )
}
