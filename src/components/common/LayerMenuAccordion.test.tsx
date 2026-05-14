import React from 'react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'

import theme from '#/common/style/theme/theme'
import LayerMenuAccordion from '#/components/common/LayerMenuAccordion'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
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

    renderWithTheme(<ControlledAccordion />)

    const button = screen.getByRole('button', {
      name: 'Toggle controlled filters',
    })

    expect(button.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('false')
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

    expect(screen.getByRole('region')).toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })

    rerender(
      <ThemeProvider theme={theme}>
        <LayerMenuAccordion
          id="separator-filters"
          title="Rakennus tasot"
          ariaLabel="Toggle separator filters"
          defaultExpanded
          showBottomSeparator={false}
        >
          <div>Separated content</div>
        </LayerMenuAccordion>
      </ThemeProvider>
    )

    expect(screen.getByRole('region')).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
  })
})
