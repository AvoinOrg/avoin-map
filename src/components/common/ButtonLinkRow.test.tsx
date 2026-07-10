import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'

import { ButtonLinkRow } from './ButtonLinkRow'

type MockAppRouteLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode
  routeKey?: unknown
  routeParams?: unknown
  sx?: unknown
}

const mockedAppRouteLink = jest.fn(
  ({
    children,
    routeKey,
    routeParams,
    sx,
    ...props
  }: MockAppRouteLinkProps) => {
    void sx

    return (
      <a
        href="#mock-link"
        data-route-key={String(routeKey)}
        data-route-params={JSON.stringify(routeParams ?? {})}
        {...props}
      >
        {children}
      </a>
    )
  }
)

jest.mock('#/common/navigation/appRouteLinks', () => ({
  __esModule: true,
  AppRouteLink: (props: MockAppRouteLinkProps) => mockedAppRouteLink(props),
}))

describe('ButtonLinkRow', () => {
  beforeEach(() => {
    mockedAppRouteLink.mockClear()
  })

  it('renders one accessible route link with the visible label', () => {
    render(
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
  })

  it('passes route params through to AppRouteLink', () => {
    render(
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
})
