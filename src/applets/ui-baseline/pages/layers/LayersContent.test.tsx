import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'

import LayersContent from './LayersContent'

type MockAppRouteLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode
  routeKey?: unknown
  routeParams?: unknown
  sx?: unknown
}

jest.mock('#/common/navigation/appRouteLinks', () => {
  const MockAppRouteLink = ({
    children,
    onClick,
    routeKey,
    routeParams,
    sx,
    ...props
  }: MockAppRouteLinkProps) => {
    void sx

    return (
      <a
        href="#mock-admin-layer"
        data-route-key={String(routeKey)}
        data-route-params={JSON.stringify(routeParams ?? {})}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    )
  }

  return {
    __esModule: true,
    AppRouteLink: MockAppRouteLink,
  }
})

const renderFixture = () =>
  render(
    <AppThemeProvider disableCssBaseline>
      <LayersContent />
    </AppThemeProvider>
  )

const expectColoredVisibility = (
  button: HTMLElement,
  isVisible: boolean
) => {
  expect(
    button.querySelector('[data-slot="layer-visible-highlight"]') != null
  ).toBe(isVisible)
}

describe('ui-baseline layers page interactions', () => {
  it('toggles the plain comparison row', () => {
    renderFixture()

    const button = screen.getByRole('button', {
      name: 'Toggle base visibility comparison layer',
    })

    expectColoredVisibility(button, true)
    fireEvent.click(button)
    expectColoredVisibility(button, false)
    fireEvent.click(button)
    expectColoredVisibility(button, true)
  })

  it('toggles admin visibility independently from its prevented mock link', () => {
    renderFixture()

    const button = screen.getByRole('button', {
      name: 'Toggle admin link comparison layer',
    })
    const link = screen.getByRole('link', {
      name: 'Open admin link comparison layer',
    })

    expectColoredVisibility(button, true)
    fireEvent.click(button)
    expectColoredVisibility(button, false)

    const linkClickResult = fireEvent.click(link)
    expect(linkClickResult).toBe(false)
    expectColoredVisibility(button, false)
    expect(window.location.hash).toBe('')
  })

  it('preserves the interactive accordion open and visibility behavior', () => {
    renderFixture()

    const button = screen.getByRole('button', {
      name: 'Toggle interactive custom layer',
    })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByLabelText('Mock category preview')).toHaveLength(2)
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
