import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import LayerMenuAccordion from '#/components/common/LayerMenuAccordion'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider disableCssBaseline>{ui}</AppThemeProvider>)
}

describe('LayerMenuAccordion', () => {
  it('toggles content and exposes ARIA state', () => {
    renderWithTheme(
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
    expect(button.getAttribute('aria-controls')).toBe(
      'building-filters-content'
    )
    expect(screen.queryByText('Accordion content')).toBeNull()

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
    const region = screen.getByRole('region')
    expect(region.textContent).toContain('Accordion content')
    expect(region.id).toBe('building-filters-content')
    expect(region.getAttribute('aria-labelledby')).toBe(
      'building-filters-button'
    )
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

    renderWithTheme(<ControlledAccordion />)

    const button = screen.getByRole('button', {
      name: 'Toggle controlled filters',
    })

    expect(button.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('aligns the title and visible arrow glyph to a 24px net inset', () => {
    renderWithTheme(
      <LayerMenuAccordion
        id="aligned-filters"
        title="Rakennus tasot"
        ariaLabel="Toggle aligned filters"
        defaultExpanded
      >
        <div>Aligned content</div>
      </LayerMenuAccordion>
    )

    const button = screen.getByRole('button', {
      name: 'Toggle aligned filters',
    })
    const title = button.querySelector(
      '[data-slot="layer-menu-accordion-title"]'
    )
    const arrow = button.querySelector(
      '[data-slot="layer-menu-accordion-arrow"]'
    )
    const arrowGlyph = button.querySelector(
      '[data-slot="layer-menu-accordion-arrow-glyph"]'
    )

    expect(button).toHaveStyle({ borderWidth: '0px' })
    expect(title).toBeInTheDocument()
    expect(arrow).toBeInTheDocument()
    expect(arrowGlyph).toBeInTheDocument()

    const buttonStyles = window.getComputedStyle(button)
    const titleStyles = window.getComputedStyle(title as Element)
    const arrowStyles = window.getComputedStyle(arrow as Element)
    const arrowGlyphStyles = window.getComputedStyle(arrowGlyph as Element)
    const titleVisibleLeftInset =
      Number.parseFloat(buttonStyles.borderLeftWidth) +
      Number.parseFloat(titleStyles.paddingLeft)
    const arrowVisibleRightInset =
      Number.parseFloat(buttonStyles.borderRightWidth) +
      Number.parseFloat(arrowStyles.marginRight) +
      (Number.parseFloat(arrowStyles.width) -
        Number.parseFloat(arrowGlyphStyles.width)) /
        2

    expect(titleVisibleLeftInset).toBe(24)
    expect(arrowVisibleRightInset).toBe(24)
  })

  it('shows the bottom separator by default and can hide it for a last accordion', () => {
    const { rerender } = renderWithTheme(
      <LayerMenuAccordion
        id="separator-filters"
        title="Rakennus tasot"
        ariaLabel="Toggle separator filters"
        defaultExpanded
      >
        <div>Separated content</div>
      </LayerMenuAccordion>
    )

    const button = screen.getByRole('button', {
      name: 'Toggle separator filters',
    })
    const region = screen.getByRole('region')
    const content = region.querySelector(
      '[data-slot="layer-menu-accordion-content"]'
    )
    const separator = region.querySelector('[aria-hidden="true"]')

    expect(button).toHaveStyle({
      padding: '0px',
    })
    expect(region).toHaveStyle({
      paddingLeft: '24px',
      paddingRight: '24px',
      boxSizing: 'border-box',
      minWidth: '0',
      width: '100%',
    })
    expect(content).toHaveStyle({
      minWidth: '0',
      width: '100%',
    })
    expect(content).toHaveTextContent('Separated content')
    expect(region).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })

    rerender(
      <AppThemeProvider disableCssBaseline>
        <LayerMenuAccordion
          id="separator-filters"
          title="Rakennus tasot"
          ariaLabel="Toggle separator filters"
          defaultExpanded
          showBottomSeparator={false}
        >
          <div>Separated content</div>
        </LayerMenuAccordion>
      </AppThemeProvider>
    )

    const regionWithoutSeparator = screen.getByRole('region')

    expect(regionWithoutSeparator).toHaveStyle({
      paddingLeft: '24px',
      paddingRight: '24px',
    })
    expect(regionWithoutSeparator).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(
      regionWithoutSeparator.querySelector('[aria-hidden="true"]')
    ).toBeNull()
    expect(
      regionWithoutSeparator.querySelector(
        '[data-slot="layer-menu-accordion-content"]'
      )
    ).toHaveStyle({ width: '100%' })
  })

  it('allows content padding to be overridden through contentSx', () => {
    renderWithTheme(
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
      paddingLeft: '0px',
      paddingRight: '0px',
    })
  })
})
