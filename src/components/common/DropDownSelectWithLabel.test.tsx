import React from 'react'
import { render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (keyName: string) => keyName,
  }),
}))

const options = [
  { value: 'heat', label: 'Heat demand' },
  { value: 'solar', label: 'Solar potential' },
]

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

describe('DropDownSelectWithLabel', () => {
  it('uses a string label as the combobox accessible name', () => {
    renderWithTheme(
      <DropDownSelectWithLabel
        value="heat"
        options={options}
        onChange={() => {}}
        label="Energy layer"
      />
    )

    expect(screen.getByRole('combobox', { name: 'Energy layer' })).toBeTruthy()
  })

  it('uses an explicit aria label instead of the visible label fallback', () => {
    renderWithTheme(
      <DropDownSelectWithLabel
        value="heat"
        options={options}
        onChange={() => {}}
        label="Energy layer"
        ariaLabel="Layer selector"
      />
    )

    expect(screen.getByRole('combobox', { name: 'Layer selector' })).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: 'Energy layer' })).toBeNull()
  })

  it('renders label actions and data slot on the wrapper', () => {
    const { container } = renderWithTheme(
      <DropDownSelectWithLabel
        value="solar"
        options={options}
        onChange={() => {}}
        label="Energy layer"
        dataSlot="energy-layer-select"
        labelAction={<span>Required</span>}
      />
    )

    expect(screen.getByText('Required')).toBeTruthy()
    expect(
      container.querySelector('[data-slot="energy-layer-select"]')
    ).toBeTruthy()
  })
})
