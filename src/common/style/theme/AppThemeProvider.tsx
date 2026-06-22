'use client'

import React from 'react'
import { GlobalStyles, ThemeProvider } from '@mui/system'

import theme, { appGlobalStyles } from './theme'
import type { AppTheme } from './system'

type Props = {
  children: React.ReactNode
  disableCssBaseline?: boolean
}

const AppThemeProvider = ({
  children,
  disableCssBaseline = false,
}: Props) => {
  return (
    <ThemeProvider<AppTheme> theme={theme}>
      {!disableCssBaseline ? (
        <GlobalStyles<AppTheme> styles={appGlobalStyles} />
      ) : null}
      {children}
    </ThemeProvider>
  )
}

export default AppThemeProvider
