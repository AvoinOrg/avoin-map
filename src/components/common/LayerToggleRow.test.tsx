import React, { useState } from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  LayerToggleRow,
  LayerToggleRowAccordion,
  LayerToggleRowLink,
} from '#/components/common/LayerToggleRow'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'

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
        href="#mock-link"
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
    expect(button.getAttribute('aria-controls')).toContain(
      'layer-toggle-row-accordion-'
    )
    expect(screen.queryByText('Accordion content')).toBeNull()

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Accordion content')).not.toBeNull()
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
          routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
          routeParams: { folayerIdSlug: 'layer-1' },
          onClick: onLinkClick,
        }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle link layer' }))
    fireEvent.click(screen.getByRole('link', { name: 'Open layer' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onLinkClick).toHaveBeenCalledTimes(1)
    expect(
      screen
        .getByRole('link', { name: 'Open layer' })
        .getAttribute('data-route-params')
    ).toBe(JSON.stringify({ folayerIdSlug: 'layer-1' }))
  })
})

describe('LayerStatusIcon', () => {
  it('shares the colored visible highlight and fixed status slot geometry across variants', () => {
    render(
      <>
        <LayerToggleRow
          label="Base layer"
          status="visible"
          color="#2f855a"
          ariaLabel="Toggle base layer"
          onToggle={() => {}}
        />
        <LayerToggleRowAccordion
          label="Accordion layer"
          status="visible"
          color="#2f855a"
          expanded={false}
          ariaLabel="Toggle accordion layer"
          onToggle={() => {}}
        >
          <div>Accordion content</div>
        </LayerToggleRowAccordion>
        <LayerToggleRowLink
          label="Link layer"
          status="visible"
          color="#2f855a"
          ariaLabel="Toggle link layer"
          onToggle={() => {}}
          linkAriaLabel="Open link layer"
          linkProps={{
            routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
            routeParams: { folayerIdSlug: 'layer-1' },
          }}
        />
      </>
    )

    const highlights = document.querySelectorAll(
      '[data-slot="layer-visible-highlight"]'
    )
    const statusSlots = document.querySelectorAll(
      '[data-slot="layer-status-icon-slot"]'
    )

    expect(highlights).toHaveLength(3)
    expect(statusSlots).toHaveLength(3)

    highlights.forEach((highlight) => {
      expect(highlight).toHaveStyle({
        width: '1.5rem',
        height: '1rem',
        borderRadius: '50%',
      })
    })
    statusSlots.forEach((slot) => {
      expect(slot).toHaveStyle({
        width: '2rem',
        height: '1.5rem',
        marginRight: '0.75rem',
      })
    })

    expect(
      screen.getByRole('button', { name: 'Toggle base layer' })
    ).toHaveStyle({ paddingLeft: 0 })
    expect(statusSlots[0]).toHaveStyle({ justifyContent: 'flex-start' })

    expect(
      screen.getByRole('button', { name: 'Toggle accordion layer' })
    ).toHaveStyle({ paddingLeft: '0.375rem' })
    expect(statusSlots[1]).toHaveStyle({ justifyContent: 'center' })

    expect(
      screen.getByRole('button', { name: 'Toggle link layer' })
    ).toHaveStyle({ paddingLeft: 0 })
    expect(statusSlots[2]).toHaveStyle({ justifyContent: 'flex-start' })
  })
})
