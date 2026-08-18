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
  const { Box: MockBox } = jest.requireActual('#/common/style/theme') as {
    Box: React.ElementType
  }

  const MockAppRouteLink = ({
    children,
    onClick,
    routeKey,
    routeParams,
    sx,
    ...props
  }: MockAppRouteLinkProps) => {
    return (
      <MockBox
        component="a"
        href="#mock-link"
        data-route-key={String(routeKey)}
        data-route-params={JSON.stringify(routeParams ?? {})}
        onClick={onClick}
        sx={sx}
        {...props}
      >
        {children}
      </MockBox>
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
  it('keeps every basic status in the same slot and compensates the colored eye', () => {
    const rows: ReadonlyArray<{
      label: string
      status: React.ComponentProps<typeof LayerToggleRow>['status']
      color?: string
      disabled?: boolean
    }> = [
      { label: 'Hidden layer', status: 'hidden' },
      { label: 'Visible layer', status: 'visible' },
      { label: 'Colored layer', status: 'visible', color: '#2f855a' },
      { label: 'Processing layer', status: 'processing' },
      { label: 'Disabled layer', status: 'hidden', disabled: true },
    ]

    render(
      <>
        {rows.map(({ label, status, color, disabled }) => (
          <LayerToggleRow
            key={label}
            label={label}
            status={status}
            color={color}
            disabled={disabled}
            ariaLabel={`Toggle ${label}`}
            onToggle={() => {}}
          />
        ))}
      </>
    )

    rows.forEach(({ label }) => {
      const button = screen.getByRole('button', {
        name: `Toggle ${label}`,
      })
      const statusSlot = button.querySelector(
        '[data-slot="layer-status-icon-slot"]'
      )

      expect(button).toHaveStyle({ paddingLeft: 0 })
      expect(statusSlot).toHaveStyle({
        width: '2rem',
        height: '1.5rem',
        marginRight: '0.75rem',
        justifyContent: 'flex-start',
      })
    })

    const highlight = document.querySelector(
      '[data-slot="layer-visible-highlight"]'
    )
    const coloredEye = document.querySelector(
      '[data-slot="layer-colored-visible-eye"]'
    )

    expect(highlight).toHaveStyle({
      width: '1.5rem',
      height: '1rem',
      borderRadius: '50%',
    })
    expect(coloredEye).toHaveStyle({
      width: '1rem',
      height: '1rem',
      transform: 'translateX(-0.25rem)',
    })
  })

  it('preserves default accordion geometry and applies opt-in geometry in either expansion state', () => {
    render(
      <>
        <LayerToggleRowAccordion
          label="Default accordion"
          status="visible"
          color="#2f855a"
          expanded={false}
          ariaLabel="Toggle default accordion"
          onToggle={() => {}}
        >
          <div>Accordion content</div>
        </LayerToggleRowAccordion>
        <LayerToggleRowAccordion
          label="Closed aligned accordion"
          status="hidden"
          expanded={false}
          applyNegativeMargins
          ariaLabel="Toggle closed aligned accordion"
          onToggle={() => {}}
        >
          <div>Closed accordion content</div>
        </LayerToggleRowAccordion>
        <LayerToggleRowAccordion
          label="Open aligned accordion"
          status="visible"
          expanded
          applyNegativeMargins
          ariaLabel="Toggle open aligned accordion"
          onToggle={() => {}}
        >
          <div>Open accordion content</div>
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

    const defaultButton = screen.getByRole('button', {
      name: 'Toggle default accordion',
    })
    const closedButton = screen.getByRole('button', {
      name: 'Toggle closed aligned accordion',
    })
    const openButton = screen.getByRole('button', {
      name: 'Toggle open aligned accordion',
    })
    const defaultStatusSlot = defaultButton.querySelector(
      '[data-slot="layer-status-icon-slot"]'
    )
    const closedStatusSlot = closedButton.querySelector(
      '[data-slot="layer-status-icon-slot"]'
    )
    const openStatusSlot = openButton.querySelector(
      '[data-slot="layer-status-icon-slot"]'
    )

    expect(defaultButton).toHaveStyle({
      width: '100%',
      paddingLeft: '0.375rem',
    })
    expect(defaultButton).not.toHaveStyle({ marginLeft: '-0.375rem' })
    expect(defaultStatusSlot).toHaveStyle({ justifyContent: 'center' })

    const alignedButtons = [closedButton, openButton]

    alignedButtons.forEach((button) => {
      expect(button).toHaveStyle({
        width: 'calc(100% + 0.75rem)',
        paddingLeft: '0.375rem',
        paddingRight: '0.375rem',
        marginLeft: '-0.375rem',
        marginRight: '-0.375rem',
      })
    })
    expect(closedStatusSlot).toHaveStyle({ justifyContent: 'flex-start' })
    expect(openStatusSlot).toHaveStyle({ justifyContent: 'flex-start' })
    expect(closedButton).not.toHaveStyle({ backgroundColor: '#e6efff' })
    expect(openButton).toHaveStyle({ backgroundColor: '#e6efff' })

    const accordionTrailingSlots = [defaultButton, ...alignedButtons].map(
      (button) =>
        button.querySelector('[data-slot="layer-trailing-action-slot"]')
    )

    accordionTrailingSlots.forEach((slot) => {
      expect(slot).toHaveStyle({
        width: '1.75rem',
        height: '1.75rem',
        marginLeft: '0.75rem',
        flexShrink: 0,
      })
    })

    const linkTrailingSlot = screen.getByRole('link', {
      name: 'Open link layer',
    })

    expect(linkTrailingSlot).toHaveAttribute(
      'data-slot',
      'layer-trailing-action-slot'
    )
    expect(linkTrailingSlot).toHaveStyle({
      width: '1.75rem',
      height: '1.75rem',
      marginLeft: '0.75rem',
      flexShrink: 0,
    })
  })

  it('lets rowSx, sx, and iconSx override opt-in accordion defaults', () => {
    render(
      <>
        <LayerToggleRowAccordion
          label="Row style override"
          status="hidden"
          expanded={false}
          applyNegativeMargins
          ariaLabel="Toggle row style override"
          onToggle={() => {}}
          rowSx={{ mx: '-1rem', width: 'calc(100% + 2rem)' }}
          iconSx={{ justifyContent: 'flex-end' }}
        >
          <div>Row style override content</div>
        </LayerToggleRowAccordion>
        <LayerToggleRowAccordion
          label="Shared style override"
          status="hidden"
          expanded={false}
          applyNegativeMargins
          ariaLabel="Toggle shared style override"
          onToggle={() => {}}
          rowSx={{ mx: '-1rem', width: 'calc(100% + 2rem)' }}
          sx={{ ml: '2rem', mr: '3rem', width: '80%' }}
        >
          <div>Shared style override content</div>
        </LayerToggleRowAccordion>
      </>
    )

    const rowOverrideButton = screen.getByRole('button', {
      name: 'Toggle row style override',
    })
    const sharedOverrideButton = screen.getByRole('button', {
      name: 'Toggle shared style override',
    })

    expect(rowOverrideButton).toHaveStyle({
      width: 'calc(100% + 2rem)',
      marginLeft: '-1rem',
      marginRight: '-1rem',
    })
    expect(
      rowOverrideButton.querySelector(
        '[data-slot="layer-status-icon-slot"]'
      )
    ).toHaveStyle({ justifyContent: 'flex-end' })
    expect(sharedOverrideButton).toHaveStyle({
      width: '80%',
      marginLeft: '2rem',
      marginRight: '3rem',
    })
  })
})
