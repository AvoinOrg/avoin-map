import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'

import theme from '#/common/style/theme/theme'
import SquishedSwitchWithLabel from '#/components/common/SquishedSwitchWithLabel'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('SquishedSwitchWithLabel', () => {
  it('uses a visible text label as the accessible switch name', () => {
    renderWithTheme(
      <SquishedSwitchWithLabel checked onChange={() => {}}>
        Maalämpö
      </SquishedSwitchWithLabel>
    )

    expect(screen.getByRole('switch', { name: 'Maalämpö' })).toBeTruthy()
  })

  it('supports an explicit accessible label for non-string content', () => {
    renderWithTheme(
      <SquishedSwitchWithLabel
        checked
        ariaLabel="Kaukolämpö"
        onChange={() => {}}
      >
        <span>Kaukolämpö</span>
      </SquishedSwitchWithLabel>
    )

    expect(screen.getByRole('switch', { name: 'Kaukolämpö' })).toBeTruthy()
  })

  it('calls onChange when clicked', () => {
    const onChange = jest.fn()

    renderWithTheme(
      <SquishedSwitchWithLabel checked onChange={onChange}>
        Sähkölämmitys
      </SquishedSwitchWithLabel>
    )

    fireEvent.click(screen.getByRole('switch', { name: 'Sähkölämmitys' }))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('renders disabled switches as disabled controls', () => {
    renderWithTheme(
      <SquishedSwitchWithLabel checked disabled onChange={() => {}}>
        Aurinkolämmitys
      </SquishedSwitchWithLabel>
    )

    expect(
      (
        screen.getByRole('switch', {
          name: 'Aurinkolämmitys',
        }) as HTMLInputElement
      ).disabled
    ).toBe(true)
  })
})
