import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import theme from '#/common/style/theme/theme'
import type { SidebarContentBoxProps } from './SidebarContentBox'

import { SidebarLoadingBlock } from './SidebarLoadingBlock'

const mockSidebarContentBox = jest.fn(
  ({ children }: SidebarContentBoxProps) => (
    <section data-testid="sidebar-content-box">{children}</section>
  )
)

jest.mock('./SidebarContentBox', () => ({
  __esModule: true,
  default: (props: SidebarContentBoxProps) => mockSidebarContentBox(props),
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider disableCssBaseline>{ui}</AppThemeProvider>)

const getLoaderFrame = () =>
  screen.getByRole('progressbar').parentElement as HTMLElement

describe('SidebarLoadingBlock', () => {
  it('forwards only the supported shell props and renders one centered progressbar', () => {
    const sxOuter = { height: '100%' }
    const sxInner = [{ p: 0 }, { backgroundColor: '#f3f3f3' }]

    renderWithTheme(
      <SidebarLoadingBlock
        scrollFadeColor="#f3f3f3"
        scrollbarSide="left"
        sxOuter={sxOuter}
        sxInner={sxInner}
        sx={{ mt: 2 }}
      />
    )

    expect(mockSidebarContentBox).toHaveBeenCalledTimes(1)

    const shellProps = mockSidebarContentBox.mock.calls[0][0]
    expect(shellProps.scrollFadeColor).toBe('#f3f3f3')
    expect(shellProps.scrollbarSide).toBe('left')
    expect(shellProps.sxOuter).toBe(sxOuter)
    expect(shellProps.sxInner).toBe(sxInner)
    expect(shellProps).not.toHaveProperty('sx')
    expect(screen.getAllByRole('progressbar')).toHaveLength(1)

    const frame = getLoaderFrame()
    expect(frame).toHaveStyle({
      display: 'flex',
      width: '100%',
      minHeight: '3rem',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '16px',
    })
    expect(screen.getByTestId('sidebar-content-box').firstElementChild).toBe(
      frame
    )
  })

  it('extends frame styles with object, array, and theme-function overrides', () => {
    const view = renderWithTheme(
      <SidebarLoadingBlock sx={{ justifyContent: 'flex-start' }} />
    )

    expect(getLoaderFrame()).toHaveStyle({ justifyContent: 'flex-start' })

    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SidebarLoadingBlock
          sx={[{ minHeight: '5rem' }, { alignItems: 'flex-start' }]}
        />
      </AppThemeProvider>
    )

    expect(getLoaderFrame()).toHaveStyle({
      display: 'flex',
      width: '100%',
      minHeight: '5rem',
      alignItems: 'flex-start',
      justifyContent: 'center',
    })

    view.rerender(
      <AppThemeProvider disableCssBaseline>
        <SidebarLoadingBlock
          sx={(theme) => ({ backgroundColor: theme.palette.primary.main })}
        />
      </AppThemeProvider>
    )

    expect(getLoaderFrame()).toHaveStyle({
      display: 'flex',
      width: '100%',
      minHeight: '3rem',
      alignItems: 'center',
      justifyContent: 'center',
    })
    expect(getLoaderFrame()).toHaveStyle({
      backgroundColor: theme.palette.primary.main,
    })
  })
})
