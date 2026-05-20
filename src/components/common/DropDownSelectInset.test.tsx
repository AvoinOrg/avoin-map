import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import theme from '#/common/style/theme/theme'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('DropDownSelectInset', () => {
  it('renders the select before the visible side label', () => {
    renderWithTheme(
      <DropDownSelectInset
        value="1970"
        options={[{ value: '1970', label: '1970 - 1979' }]}
        onChange={() => {}}
        label="Rakennusvuosi"
        ariaLabel="Valitse rakennusvuosi"
      />
    )

    const select = screen.getByRole('combobox', {
      name: 'Valitse rakennusvuosi',
    })
    const label = screen.getByText('Rakennusvuosi')

    expect(select.compareDocumentPosition(label)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(screen.getByText('1970 - 1979')).toBeTruthy()
  })
})
