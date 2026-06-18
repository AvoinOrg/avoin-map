import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import DropDownMultiSelect from '#/components/common/DropDownMultiSelect'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

const options = [
  { value: 'heat', label: 'Heat demand' },
  { value: 'solar', label: 'Solar potential' },
  { value: 'emissions', label: 'Emissions' },
]

describe('DropDownMultiSelect', () => {
  it('passes a compatibility event with the next selected values', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <DropDownMultiSelect
        value={['heat']}
        options={options}
        onChange={handleChange}
        ariaLabel="Layer filters"
      />
    )

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Layer filters' })
    )
    const option = await screen.findByRole('option', { name: 'Solar potential' })

    fireEvent.mouseMove(option)
    fireEvent.click(option)

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: ['heat', 'solar'] },
        })
      )
    })
  })

  it('opens the option list from a normal trigger click', async () => {
    renderWithTheme(
      <DropDownMultiSelect
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Clickable layer filters"
      />
    )

    fireEvent.click(
      screen.getByRole('combobox', { name: 'Clickable layer filters' })
    )

    expect(
      await screen.findByRole('option', { name: 'Heat demand' })
    ).toBeVisible()
  })

  it('marks selected options in the open list', async () => {
    renderWithTheme(
      <DropDownMultiSelect
        value={['emissions']}
        options={options}
        onChange={() => {}}
        ariaLabel="Selected layer filters"
        defaultOpen
      />
    )

    const selectedOption = await screen.findByRole('option', {
      name: 'Emissions',
    })

    expect(selectedOption.getAttribute('aria-selected')).toBe('true')
  })

  it('does not render selected checkmarks for unchecked options', async () => {
    renderWithTheme(
      <DropDownMultiSelect
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Empty layer filters"
        defaultOpen
      />
    )

    const uncheckedOption = await screen.findByRole('option', {
      name: 'Heat demand',
    })

    expect(uncheckedOption).toHaveTextContent('Heat demand')
    expect(uncheckedOption).not.toHaveTextContent('✔')
    expect(uncheckedOption.getAttribute('aria-selected')).toBe('false')
  })

  it('supports keyboard navigation and selection from the trigger', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <DropDownMultiSelect
        value={['heat']}
        options={options}
        onChange={handleChange}
        ariaLabel="Keyboard layer filters"
      />
    )

    const trigger = screen.getByRole('combobox', {
      name: 'Keyboard layer filters',
    })

    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const selectedOption = await screen.findByRole('option', {
      name: 'Heat demand',
    })

    fireEvent.keyDown(selectedOption, { key: 'ArrowDown' })
    const nextOption = screen.getByRole('option', { name: 'Solar potential' })
    fireEvent.keyDown(nextOption, { key: 'Enter' })

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { value: ['heat', 'solar'] },
        })
      )
    })
  })
})
