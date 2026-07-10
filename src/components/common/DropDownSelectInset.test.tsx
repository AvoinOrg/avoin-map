import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import {
  SHARED_CONTROL_BORDER_RADIUS,
  SHARED_CONTROL_INFINITE_BORDER_RADIUS,
} from '#/common/style/theme/constants'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import DropDownSelect from '#/components/common/DropDownSelect'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (keyName: string) => keyName,
  }),
}))

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
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

  it('passes a local event with target.value when selecting an option', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <DropDownSelect
        value=""
        options={[
          { value: 'heat', label: 'Heat demand' },
          { value: 'solar', label: 'Solar potential' },
        ]}
        onChange={handleChange}
        placeholder="Choose layer"
        ariaLabel="Layer"
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Layer' }))
    const option = await screen.findByRole('option', {
      name: 'Solar potential',
    })
    fireEvent.mouseMove(option)
    await waitFor(() => {
      expect(option.hasAttribute('data-highlighted')).toBe(true)
    })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: 'solar' },
      })
    )
  })

  it('allows a default-open empty selection menu to close', async () => {
    renderWithTheme(
      <DropDownSelect
        value=""
        options={[{ value: 'heat', label: 'Heat demand' }]}
        onChange={() => {}}
        allowEmpty
        defaultOpen
        placeholder="Choose layer"
        ariaLabel="Closable empty select"
      />
    )

    expect(await screen.findByRole('option', { name: 'Empty selection' }))
      .toBeTruthy()

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Closable empty select' })
          .getAttribute('aria-expanded')
      ).toBe('false')
    })
  })

  it('commits the highlighted option with Enter from the keyboard', async () => {
    const handleChange = jest.fn()

    const ControlledSelect = () => {
      const [value, setValue] = React.useState('heat')

      return (
        <DropDownSelect
          value={value}
          options={[
            { value: 'heat', label: 'Heat demand' },
            { value: 'solar', label: 'Solar potential' },
            { value: 'emissions', label: 'Emissions' },
          ]}
          onChange={(event) => {
            handleChange(event)
            setValue(event.target.value)
          }}
          ariaLabel="Keyboard layer"
        />
      )
    }

    renderWithTheme(<ControlledSelect />)

    const combobox = screen.getByRole('combobox', {
      name: 'Keyboard layer',
    })

    combobox.focus()
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    const heatOption = await screen.findByRole('option', {
      name: 'Heat demand',
    })
    const solarOption = await screen.findByRole('option', {
      name: 'Solar potential',
    })
    heatOption.focus()
    fireEvent.keyDown(heatOption, { key: 'ArrowDown' })

    await waitFor(() => {
      expect(solarOption.hasAttribute('data-highlighted')).toBe(true)
    })

    solarOption.focus()
    fireEvent.keyDown(solarOption, { key: 'Enter' })

    await waitFor(() => {
      expect(combobox.textContent).toContain('Solar potential')
    })
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        target: { value: 'solar' },
      })
    )
  })

  it('renders placeholder, empty option, and invalid value states', async () => {
    const { rerender } = renderWithTheme(
      <DropDownSelect
        key="placeholder"
        value=""
        options={[{ value: 'heat', label: 'Heat demand' }]}
        onChange={() => {}}
        placeholder="Choose layer"
        allowEmpty
        ariaLabel="Layer state"
      />
    )

    expect(screen.getByText('Choose layer')).toBeTruthy()
    fireEvent.click(screen.getByRole('combobox', { name: 'Layer state' }))
    expect(await screen.findByRole('option', { name: 'Empty selection' }))
      .toBeTruthy()

    rerender(
      <AppThemeProvider>
        <DropDownSelect
          key="invalid"
          value="legacy"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          defaultOpen
          ariaLabel="Invalid state"
        />
      </AppThemeProvider>
    )

    expect(
      screen.getByRole('combobox', { name: 'Invalid state' }).textContent
    ).toContain('legacy')
    expect(await screen.findByRole('option', { name: 'Invalid value legacy' }))
      .toBeTruthy()
  })

  it('uses a pill radius for the closed trigger while keeping the popup moderate', async () => {
    renderWithTheme(
      <DropDownSelect
        value="heat"
        options={[
          { value: 'heat', label: 'Heat demand' },
          { value: 'solar', label: 'Solar potential' },
        ]}
        onChange={() => {}}
        ariaLabel="Radius layer"
      />
    )

    const trigger = screen.getByRole('combobox', { name: 'Radius layer' })
    const outline = trigger.querySelector('.MuiOutlinedInput-notchedOutline')

    expect(trigger).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })
    expect(outline).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })

    fireEvent.click(trigger)
    expect(await screen.findByRole('option', { name: 'Solar potential' }))
      .toBeTruthy()

    expect(document.querySelector('[data-slot="popup"]')).toHaveStyle({
      borderRadius: SHARED_CONTROL_BORDER_RADIUS,
    })
  })
})
