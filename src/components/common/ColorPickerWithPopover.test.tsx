import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'

jest.mock('react-colorful', () => ({
  HexColorPicker: ({
    color,
    onChange,
    style,
  }: {
    color: string
    onChange: (nextColor: string) => void
    style?: React.CSSProperties
  }) => (
    <div data-testid="hex-color-picker" style={style}>
      <span data-testid="picker-color">{color}</span>
      <button type="button" onClick={() => onChange('#123456')}>
        Pick #123456
      </button>
      <button type="button" onClick={() => onChange('#654321')}>
        Pick #654321
      </button>
    </div>
  ),
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

const getSwatch = () => screen.getByTestId('color-swatch')

describe('ColorPickerWithPopover', () => {
  it('uses ariaLabel, labelText, and fallback text for the trigger name', () => {
    const { rerender } = renderWithTheme(
      <ColorPickerWithPopover
        color="#ff0000"
        onChange={() => {}}
        ariaLabel="Layer color"
        labelText="Visible color"
        colorBoxProps={{ 'data-testid': 'color-swatch' }}
      />
    )

    expect(screen.getByRole('button', { name: 'Layer color' })).toBeVisible()

    rerender(
      <AppThemeProvider>
        <ColorPickerWithPopover
          color="#ff0000"
          onChange={() => {}}
          labelText="Visible color"
          colorBoxProps={{ 'data-testid': 'color-swatch' }}
        />
      </AppThemeProvider>
    )

    expect(screen.getByRole('button', { name: 'Visible color' })).toBeVisible()

    rerender(
      <AppThemeProvider>
        <ColorPickerWithPopover
          color="#ff0000"
          onChange={() => {}}
          colorBoxProps={{ 'data-testid': 'color-swatch' }}
        />
      </AppThemeProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Open color picker' })
    ).toBeVisible()
  })

  it('opens the popup and describes the trigger while open', async () => {
    renderWithTheme(
      <ColorPickerWithPopover
        color="#ff0000"
        onChange={() => {}}
        ariaLabel="Layer color"
        colorBoxProps={{ 'data-testid': 'color-swatch' }}
      />
    )

    const trigger = screen.getByRole('button', { name: 'Layer color' })
    expect(trigger).not.toHaveAttribute('aria-describedby')

    fireEvent.click(trigger)

    const picker = await screen.findByTestId('hex-color-picker')
    const describedBy = trigger.getAttribute('aria-describedby')

    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy ?? '')).toContainElement(picker)
  })

  it('keeps draft changes internal until the popup closes', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <ColorPickerWithPopover
        color="#ff0000"
        onChange={handleChange}
        ariaLabel="Layer color"
        colorBoxProps={{ 'data-testid': 'color-swatch' }}
      />
    )

    const trigger = screen.getByRole('button', { name: 'Layer color' })
    fireEvent.click(trigger)
    fireEvent.click(await screen.findByRole('button', { name: 'Pick #123456' }))

    expect(screen.getByTestId('picker-color')).toHaveTextContent('#123456')
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.click(trigger)

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('#123456')
    })
  })

  it('does not commit when the draft color is unchanged', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <ColorPickerWithPopover
        color="#ff0000"
        onChange={handleChange}
        ariaLabel="Layer color"
        colorBoxProps={{ 'data-testid': 'color-swatch' }}
      />
    )

    const trigger = screen.getByRole('button', { name: 'Layer color' })
    fireEvent.click(trigger)
    await screen.findByTestId('hex-color-picker')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.queryByTestId('hex-color-picker')).not.toBeInTheDocument()
    })
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('updates the closed swatch when the controlled color prop changes', () => {
    const { rerender } = renderWithTheme(
      <ColorPickerWithPopover
        color="#ff0000"
        onChange={() => {}}
        ariaLabel="Layer color"
        colorBoxProps={{ 'data-testid': 'color-swatch' }}
      />
    )

    expect(getComputedStyle(getSwatch()).backgroundColor).toBe(
      'rgb(255, 0, 0)'
    )

    rerender(
      <AppThemeProvider>
        <ColorPickerWithPopover
          color="#00ff00"
          onChange={() => {}}
          ariaLabel="Layer color"
          colorBoxProps={{ 'data-testid': 'color-swatch' }}
        />
      </AppThemeProvider>
    )

    expect(getComputedStyle(getSwatch()).backgroundColor).toBe(
      'rgb(0, 255, 0)'
    )
  })

  it('opens with the latest controlled color after a closed prop change', async () => {
    const { rerender } = renderWithTheme(
      <ColorPickerWithPopover
        color="#ff0000"
        onChange={() => {}}
        ariaLabel="Layer color"
        colorBoxProps={{ 'data-testid': 'color-swatch' }}
      />
    )

    rerender(
      <AppThemeProvider>
        <ColorPickerWithPopover
          color="#00ff00"
          onChange={() => {}}
          ariaLabel="Layer color"
          colorBoxProps={{ 'data-testid': 'color-swatch' }}
        />
      </AppThemeProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Layer color' }))

    expect(await screen.findByTestId('picker-color')).toHaveTextContent(
      '#00ff00'
    )
  })

  it('does not overwrite the open draft when the controlled color prop changes', async () => {
    const { rerender } = renderWithTheme(
      <ColorPickerWithPopover
        color="#ff0000"
        onChange={() => {}}
        ariaLabel="Layer color"
        colorBoxProps={{ 'data-testid': 'color-swatch' }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Layer color' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Pick #123456' }))

    rerender(
      <AppThemeProvider>
        <ColorPickerWithPopover
          color="#00ff00"
          onChange={() => {}}
          ariaLabel="Layer color"
          colorBoxProps={{ 'data-testid': 'color-swatch' }}
        />
      </AppThemeProvider>
    )

    expect(screen.getByTestId('picker-color')).toHaveTextContent('#123456')
    expect(getComputedStyle(getSwatch()).backgroundColor).toBe(
      'rgb(0, 255, 0)'
    )
  })
})
