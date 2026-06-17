'use client'

import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import theme from './theme'

type Props = {
  children: React.ReactNode
  disableCssBaseline?: boolean
}

const AppThemeProvider = ({
  children,
  disableCssBaseline = false,
}: Props) => {
  return (
    <ThemeProvider theme={theme}>
      {!disableCssBaseline ? <CssBaseline /> : null}
      {children}
    </ThemeProvider>
  )
}

export default AppThemeProvider
