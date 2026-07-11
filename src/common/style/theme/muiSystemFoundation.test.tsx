import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import {
  Box,
  AppThemeProvider,
  AppSxProps,
  useTheme,
} from '#/common/style/theme'
import type { AppTheme } from '#/common/style/theme/system'
import { appGlobalStyles } from './theme'

const ThemeProbe = () => {
  const theme = useTheme<AppTheme>()

  return (
    <pre
      data-testid="system-theme-summary"
      data-theme-summary={JSON.stringify({
        neutralLighter: theme.palette.neutral.lighter,
        neutralDark: theme.palette.neutral.dark,
        body7: theme.typography.body7,
        h7: theme.typography.h7,
        desktopBreakpoint: theme.breakpoints.values.desktop,
        borderRadius: theme.shape.borderRadius,
        mapButtons: theme.zIndex.mapButtons,
        popup: theme.zIndex.popup,
        modal: theme.zIndex.modal,
        snackbar: theme.zIndex.snackbar,
        shadow0: theme.shadows?.[0],
        shadow1: theme.shadows?.[1],
      })}
    />
  )
}

describe('MUI System foundation theme interoperability', () => {
  it('shares Material theme values with System theme consumers', () => {
    render(
      <AppThemeProvider>
        <ThemeProbe />
      </AppThemeProvider>
    )

    const summaryElement = document.querySelector(
      '[data-testid="system-theme-summary"]'
    ) as HTMLPreElement
    const summary = JSON.parse(
      summaryElement.getAttribute('data-theme-summary') || '{}'
    )

    expect(summary.neutralLighter).toBe('#FFFFFF')
    expect(summary.neutralDark).toBe('#A0A0A0')
    expect(summary.h7?.fontSize).toBe('0.875rem')
    expect(summary.body7?.fontSize).toBe('0.75rem')
    expect(summary.desktopBreakpoint).toBe(600)
    expect(summary.borderRadius).toBe(0)
    expect(summary.mapButtons).toBe(1300)
    expect(summary.popup).toBe(1500)
    expect(summary.modal).toBe(1500)
    expect(summary.snackbar).toBe(1600)
    expect(summary.shadow0).toBe('none')
    expect(summary.shadow1).toBe('none')
  })

  it('exports shared primitives and types for Foundation usage', () => {
    const typedProbe: AppSxProps = {
      mt: { mobile: 2, desktop: 4 },
    }

    expect(typedProbe.mt).toBeDefined()

    render(
      <AppThemeProvider>
        <Box data-testid="system-box" sx={typedProbe} />
      </AppThemeProvider>
    )

    expect(document.querySelector('[data-testid="system-box"]')).toBeInTheDocument()
  })

  it('keeps native form controls on the application font family', () => {
    expect(appGlobalStyles).toMatchObject({
      'button, input, select, textarea': {
        fontFamily: 'inherit',
      },
    })
  })
})
