import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import CheckBoxWithLabel from '#/components/common/CheckBoxWithLabel'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider disableCssBaseline>{ui}</AppThemeProvider>)
}

describe('CheckBoxWithLabel', () => {
  it('uses a visible text label as the accessible checkbox name', () => {
    renderWithTheme(
      <CheckBoxWithLabel checked onChange={() => {}}>
        Avoin kuva
      </CheckBoxWithLabel>
    )

    expect(screen.getByRole('checkbox', { name: 'Avoin kuva' })).toBeTruthy()
  })

  it('supports an explicit accessible label for non-string content', () => {
    renderWithTheme(
      <CheckBoxWithLabel
        checked
        aria-label="Avoin kuva"
        onChange={() => {}}
        inputProps={{ 'aria-label': 'Erillinen valinta' }}
      >
        <span>Avoin kuva</span>
      </CheckBoxWithLabel>
    )

    expect(screen.getByRole('checkbox', { name: 'Erillinen valinta' }))
      .toBeTruthy()
  })

  it('forwards checked state and checked callback argument', () => {
    const onChange = jest.fn()

    renderWithTheme(
      <CheckBoxWithLabel defaultChecked={false} onChange={onChange}>
        Kaukolämpö
      </CheckBoxWithLabel>
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Kaukolämpö' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const callArgs = onChange.mock.calls[0]
    const event = callArgs[0] as React.ChangeEvent<HTMLInputElement>
    const checkedValue = callArgs[1] as boolean

    expect(event.target).toBeInstanceOf(HTMLInputElement)
    expect(checkedValue).toBe((event.target as HTMLInputElement).checked)
  })

  it('renders disabled checkbox and keeps required marker and accessibility flag', () => {
    renderWithTheme(
      <CheckBoxWithLabel checked disabled required onChange={() => {}}>
        Aurinkolämmitys
      </CheckBoxWithLabel>
    )

    const checkboxInput = screen.getByRole('checkbox', {
      name: 'Aurinkolämmitys',
    }) as HTMLInputElement

    expect(checkboxInput.disabled).toBe(true)
    expect(checkboxInput.required).toBe(true)
    expect(screen.getByText('*')).not.toBe(null)
  })
})
