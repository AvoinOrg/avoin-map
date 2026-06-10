import '#/test/baseUiTestPolyfills'
import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  LayerToggleRow,
  LayerToggleRowAccordion,
  LayerToggleRowLink,
} from '#/components/common/LayerToggleRow'

type MockMutableLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode
  route?: unknown
  routeTree?: unknown
  params?: unknown
  styleProps?: unknown
}

jest.mock('#/components/common/MutableLink', () => {
  const MockMutableLink = ({
    children,
    onClick,
    route: _route,
    routeTree: _routeTree,
    params: _params,
    styleProps: _styleProps,
    ...props
  }: MockMutableLinkProps) => {
    void _route
    void _routeTree
    void _params
    void _styleProps

    return (
      <a href="#mock-link" onClick={onClick} {...props}>
        {children}
      </a>
    )
  }

  return {
    __esModule: true,
    default: MockMutableLink,
  }
})

describe('LayerToggleRow', () => {
  it('toggles from the row', () => {
    const onToggle = jest.fn()

    render(
      <LayerToggleRow
        label="Layer"
        status="hidden"
        ariaLabel="Toggle layer"
        onToggle={onToggle}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle layer' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('does not toggle when disabled', () => {
    const onToggle = jest.fn()

    render(
      <LayerToggleRow
        label="Layer"
        status="hidden"
        ariaLabel="Toggle layer"
        disabled
        onToggle={onToggle}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle layer' }))

    expect(onToggle).not.toHaveBeenCalled()
  })

  it('renders a progress indicator while processing', () => {
    render(
      <LayerToggleRow
        label="Layer"
        status="processing"
        ariaLabel="Toggle processing layer"
        onToggle={() => {}}
      />
    )

    expect(screen.getByRole('progressbar', { name: 'Loading' }))
      .toBeInTheDocument()
  })
})

describe('LayerToggleRowAccordion', () => {
  const ControlledAccordion = () => {
    const [expanded, setExpanded] = useState(false)

    return (
      <LayerToggleRowAccordion
        label="Layer"
        status={expanded ? 'visible' : 'hidden'}
        ariaLabel="Toggle accordion layer"
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
      >
        <div>Accordion content</div>
      </LayerToggleRowAccordion>
    )
  }

  it('exposes controlled expanded state from row clicks', () => {
    render(<ControlledAccordion />)

    const button = screen.getByRole('button', {
      name: 'Toggle accordion layer',
    })

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Accordion content')).toBeNull()

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region')).toHaveTextContent('Accordion content')
  })
})

describe('LayerToggleRowLink', () => {
  it('keeps row toggle and link click separate', () => {
    const onToggle = jest.fn()
    const onLinkClick = jest.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
    })

    render(
      <LayerToggleRowLink
        label="Layer"
        status="hidden"
        ariaLabel="Toggle link layer"
        onToggle={onToggle}
        linkAriaLabel="Open layer"
        linkProps={{
          route: {} as never,
          routeTree: {} as never,
          onClick: onLinkClick,
        }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle link layer' }))
    fireEvent.click(screen.getByRole('link', { name: 'Open layer' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onLinkClick).toHaveBeenCalledTimes(1)
  })
})
