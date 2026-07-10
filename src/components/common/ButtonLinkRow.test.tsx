import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import {
  AppThemeProvider,
  Box,
  type AppSxProps,
} from '#/common/style/theme'
import { SHARED_CONTROL_INFINITE_BORDER_RADIUS } from '#/common/style/theme/constants'

import { ButtonLinkRow } from './ButtonLinkRow'

type MockAppRouteLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode
  routeKey?: unknown
  routeParams?: unknown
  sx?: AppSxProps
}

const MockAppRouteLinkBox = Box as React.ElementType

const mockedAppRouteLink = jest.fn(
  ({
    children,
    routeKey,
    routeParams,
    sx,
    ...props
  }: MockAppRouteLinkProps) => {
    return (
      <MockAppRouteLinkBox
        component="a"
        href="#mock-link"
        data-route-key={String(routeKey)}
        data-route-params={JSON.stringify(routeParams ?? {})}
        sx={sx}
        {...props}
      >
        {children}
      </MockAppRouteLinkBox>
    )
  }
)

jest.mock('#/common/navigation/appRouteLinks', () => ({
  __esModule: true,
  AppRouteLink: (props: MockAppRouteLinkProps) => mockedAppRouteLink(props),
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

describe('ButtonLinkRow', () => {
  beforeEach(() => {
    mockedAppRouteLink.mockClear()
  })

  it('renders one accessible route link with the visible label', () => {
    renderWithTheme(
      <ButtonLinkRow
        routeKey={APP_ROUTE_KEYS.UI_BASELINE_BUTTONS_TOGGLES}
        label="Buttons and toggles"
      />
    )

    const link = screen.getByRole('link', { name: 'Buttons and toggles' })

    expect(link).toHaveAttribute(
      'data-route-key',
      APP_ROUTE_KEYS.UI_BASELINE_BUTTONS_TOGGLES
    )
    expect(link).toHaveAttribute('href', '#mock-link')
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(link).toHaveStyle({
      minHeight: '2.25rem',
      paddingTop: '0.375rem',
      paddingBottom: '0.375rem',
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })
  })

  it('passes route params through to AppRouteLink', () => {
    renderWithTheme(
      <ButtonLinkRow
        routeKey={APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER}
        routeParams={{ folayerIdSlug: 'layer-1' }}
        label={<span>Layer details</span>}
      />
    )

    expect(screen.getByRole('link', { name: 'Layer details' })).toHaveAttribute(
      'data-route-params',
      JSON.stringify({ folayerIdSlug: 'layer-1' })
    )
    expect(mockedAppRouteLink).toHaveBeenCalledWith(
      expect.objectContaining({
        routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
        routeParams: { folayerIdSlug: 'layer-1' },
      })
    )
  })

  it('applies caller sx after the shared defaults', () => {
    renderWithTheme(
      <ButtonLinkRow
        routeKey={APP_ROUTE_KEYS.UI_BASELINE_BUTTONS_TOGGLES}
        label="Custom row"
        sx={{ minHeight: '3rem', borderRadius: 0 }}
      />
    )

    expect(screen.getByRole('link', { name: 'Custom row' })).toBeInTheDocument()
    expect(mockedAppRouteLink.mock.calls[0]?.[0].sx).toEqual([
      expect.objectContaining({ minHeight: '2.25rem' }),
      expect.objectContaining({ minHeight: '3rem', borderRadius: 0 }),
    ])
  })
})
