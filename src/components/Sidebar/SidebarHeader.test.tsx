import React from 'react'
import { render, screen } from '@testing-library/react'
import { unstable_styleFunctionSx } from '@mui/system'

import { SIDEBAR_HEADER_EDGE_INSET_REM } from '#/common/style/theme/constants'
import theme from '#/common/style/theme/theme'
import type { AppBoxProps } from '#/common/style/theme/system'

import SidebarHeader from './SidebarHeader'

let mockCapturedHeaderSx: AppBoxProps['sx']

jest.mock('#/common/style/theme/system', () => {
  const actual = jest.requireActual('#/common/style/theme/system')

  return {
    ...actual,
    Box: ({ component = 'div', sx, ...props }: AppBoxProps) => {
      if (props.className === 'sidebar-header') {
        mockCapturedHeaderSx = sx
      }

      return React.createElement(component, props)
    },
  }
})

type ResolvedStyle = Record<string, string | number | ResolvedStyle>

describe('SidebarHeader', () => {
  it.each(['mobile', 'desktop'] as const)(
    'keeps the %s hero top and horizontal edge insets equal',
    (breakpoint) => {
      render(
        <SidebarHeader title="Test title">
          <span>Test child</span>
        </SidebarHeader>
      )

      const resolvedSx = unstable_styleFunctionSx({
        sx: mockCapturedHeaderSx,
        theme,
      }) as ResolvedStyle[]
      const breakpointStyle = resolvedSx[0][
        theme.breakpoints.up(breakpoint)
      ] as ResolvedStyle
      const expectedInset = `${SIDEBAR_HEADER_EDGE_INSET_REM}rem`

      expect(breakpointStyle.paddingTop).toBe(expectedInset)
      expect(breakpointStyle.paddingTop).toBe(breakpointStyle.paddingLeft)
      expect(breakpointStyle.paddingTop).toBe(breakpointStyle.paddingRight)
      expect(screen.getByRole('heading', { name: 'Test title' })).toBeTruthy()
      expect(screen.getByText('Test child')).toBeTruthy()
    }
  )
})
