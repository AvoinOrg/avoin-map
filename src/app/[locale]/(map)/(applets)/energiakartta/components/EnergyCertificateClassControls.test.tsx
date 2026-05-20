import React from 'react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'

import theme from '#/common/style/theme/theme'
import { ENERGY_CERTIFICATE_CLASS_CODES } from '../layers/energyCertificateLayerConf'
import { useAppletStore } from '../state/appletStore'
import EnergyCertificateClassControls from './EnergyCertificateClassControls'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) =>
      key === 'sidebar.front_page.layers.energy_classes'
        ? 'Energy classes'
        : key,
  }),
}))

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('EnergyCertificateClassControls', () => {
  beforeEach(() => {
    useAppletStore.getState().resetEnergyCertificateClassFilters()
  })

  it('renders accessible A-G class buttons with pressed state', () => {
    renderWithTheme(<EnergyCertificateClassControls />)

    for (const classCode of ENERGY_CERTIFICATE_CLASS_CODES) {
      const button = screen.getByRole('button', {
        name: `Energy classes ${classCode}`,
      })

      expect(button).toHaveAttribute('aria-pressed', 'true')
    }
  })

  it('toggles only the clicked class', () => {
    renderWithTheme(<EnergyCertificateClassControls />)

    fireEvent.click(screen.getByRole('button', { name: 'Energy classes A' }))

    expect(
      screen.getByRole('button', { name: 'Energy classes A' })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: 'Energy classes B' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(useAppletStore.getState().activeEnergyCertificateClasses).toEqual([
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ])
  })

  it('uses the inactive grey style when a class is toggled off', () => {
    renderWithTheme(<EnergyCertificateClassControls />)

    const button = screen.getByRole('button', { name: 'Energy classes A' })
    fireEvent.click(button)

    expect(button).toHaveStyle({ backgroundColor: '#BFBFBF' })
    expect(screen.getByText('A')).toHaveStyle({ color: '#FFFFFF' })
  })

  it('renders vertical mobile controls without changing the shared state model', () => {
    renderWithTheme(
      <EnergyCertificateClassControls variant="mobile" orientation="vertical" />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Energy classes E' }))

    expect(useAppletStore.getState().activeEnergyCertificateClasses).toEqual([
      'A',
      'B',
      'C',
      'D',
      'F',
      'G',
    ])
  })
})
