import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import SquishedSwitchWithLabel from '#/components/common/SquishedSwitchWithLabel'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider disableCssBaseline>{ui}</AppThemeProvider>)
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

  it('calls onChange when clicked and provides both callback signatures', () => {
    const onChange = jest.fn()
    renderWithTheme(
      <SquishedSwitchWithLabel defaultChecked={false} onChange={onChange}>
        Sähkölämmitys
      </SquishedSwitchWithLabel>
    )

    fireEvent.click(screen.getByRole('switch', { name: 'Sähkölämmitys' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          checked: true,
        }),
      }),
      true
    )
  })

  it('renders disabled switches as disabled controls and keeps required text when required', () => {
    renderWithTheme(
      <SquishedSwitchWithLabel
        checked
        disabled
        required
        onChange={() => {}}
      >
        Aurinkolämmitys
      </SquishedSwitchWithLabel>
    )

    const switchInput = screen.getByRole('switch', {
      name: 'Aurinkolämmitys',
    }) as HTMLInputElement

    expect(switchInput.disabled).toBe(true)
    expect(switchInput.required).toBe(true)
    expect(screen.getByText('*')).not.toBe(null)
  })

  it('supports disabled style with non-string label and explicit aria label', () => {
    renderWithTheme(
      <SquishedSwitchWithLabel
        checked={false}
        disabled
        required
        ariaLabel="Explicit switch label"
        onChange={() => {}}
      >
        <span>Ei-merkitty teksti</span>
      </SquishedSwitchWithLabel>
    )

    const disabledInput = screen.getByRole('switch', {
      name: 'Explicit switch label',
    }) as HTMLInputElement

    expect(disabledInput.disabled).toBe(true)
    expect(disabledInput.required).toBe(true)
    expect(screen.getAllByText('*').length).toBeGreaterThan(0)
  })
})
