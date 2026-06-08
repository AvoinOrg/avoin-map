import '#/test/baseUiTestPolyfills'
import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import LayerMenuAccordion from '#/components/common/LayerMenuAccordion'

describe('LayerMenuAccordion', () => {
  it('toggles content and exposes ARIA state', () => {
    render(
      <LayerMenuAccordion
        id="building-filters"
        title="Rakennus tasot"
        ariaLabel="Toggle building filters"
      >
        <div>Accordion content</div>
      </LayerMenuAccordion>
    )

    const button = screen.getByRole('button', {
      name: 'Toggle building filters',
    })

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Accordion content')).toBeNull()

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
    const region = screen.getByRole('region')
    expect(region.textContent).toContain('Accordion content')
    expect(region.id).toBe('building-filters-content')
  })

  it('supports controlled expanded state', () => {
    const ControlledAccordion = () => {
      const [expanded, setExpanded] = React.useState(true)

      return (
        <LayerMenuAccordion
          id="controlled-filters"
          title="Rakennus tasot"
          ariaLabel="Toggle controlled filters"
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          <div>Controlled content</div>
        </LayerMenuAccordion>
      )
    }

    render(<ControlledAccordion />)

    const button = screen.getByRole('button', {
      name: 'Toggle controlled filters',
    })

    expect(button.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('shows the bottom separator by default and can hide it for a last accordion', () => {
    const { rerender } = render(
      <LayerMenuAccordion
        id="separator-filters"
        title="Rakennus tasot"
        ariaLabel="Toggle separator filters"
        defaultExpanded
      >
        <div>Separated content</div>
      </LayerMenuAccordion>
    )

    const region = screen.getByRole('region')
    const separator = region.querySelector('[aria-hidden="true"]')

    expect(region).toHaveStyle({
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    })
    expect(region).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })

    rerender(
      <LayerMenuAccordion
        id="separator-filters"
        title="Rakennus tasot"
        ariaLabel="Toggle separator filters"
        defaultExpanded
        showBottomSeparator={false}
      >
        <div>Separated content</div>
      </LayerMenuAccordion>
    )

    const regionWithoutSeparator = screen.getByRole('region')

    expect(regionWithoutSeparator).toHaveStyle({
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    })
    expect(regionWithoutSeparator).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(
      regionWithoutSeparator.querySelector('[aria-hidden="true"]')
    ).toBeNull()
  })

  it('allows content padding to be overridden through contentSx', () => {
    render(
      <LayerMenuAccordion
        id="flush-content-filters"
        title="Rakennus tasot"
        ariaLabel="Toggle flush content filters"
        defaultExpanded
        contentSx={{ px: 0 }}
      >
        <div>Flush content</div>
      </LayerMenuAccordion>
    )

    expect(screen.getByRole('region')).toHaveStyle({
      paddingLeft: '0rem',
      paddingRight: '0rem',
    })
  })
})
