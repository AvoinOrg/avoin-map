import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import MultiSelectAutocomplete from '#/components/common/MultiSelectAutocomplete'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

const options = [
  { value: 'central-plan', label: 'Central plan' },
  { value: 'harbor-plan', label: 'Harbor plan' },
  { value: 'forest-edge', label: 'Forest edge' },
]

describe('MultiSelectAutocomplete', () => {
  it('passes selected options when an option is selected', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={handleChange}
        ariaLabel="Compare plans"
        defaultOpen
      />
    )

    fireEvent.click(await screen.findByRole('option', { name: 'Harbor plan' }))

    expect(handleChange).toHaveBeenCalledWith(expect.anything(), [options[1]])
  })

  it('links the input to the rendered Base UI listbox', async () => {
    renderWithTheme(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Compare plans"
        defaultOpen
      />
    )

    const input = screen.getByRole('combobox', { name: 'Compare plans' })
    const listbox = await screen.findByRole('listbox')

    expect(listbox).toHaveAttribute('id')
    expect(input).toHaveAttribute('aria-controls', listbox.id)
    expect(screen.getByRole('option', { name: 'Central plan' })).toHaveAttribute(
      'id'
    )
  })

  it('selects a highlighted option with the keyboard from the input', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={handleChange}
        ariaLabel="Compare plans"
      />
    )

    const input = screen.getByRole('combobox', { name: 'Compare plans' })

    fireEvent.click(input)
    await screen.findByRole('listbox')
    fireEvent.keyDown(input, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      which: 40,
    })

    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant')
    )
    const activeOptionId = input.getAttribute('aria-activedescendant')
    const activeOption = activeOptionId
      ? document.getElementById(activeOptionId)
      : null
    expect(activeOption).toHaveTextContent('Central plan')
    fireEvent.keyDown(input, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
    })

    expect(handleChange).toHaveBeenCalledWith(expect.anything(), [options[0]])
  })

  it('opens and filters options when the user types', async () => {
    renderWithTheme(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Compare plans"
      />
    )

    const input = screen.getByRole('combobox', { name: 'Compare plans' })

    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'har' } })

    expect(screen.getByRole('option', { name: 'Harbor plan' })).toBeVisible()
    expect(screen.queryByRole('option', { name: 'Central plan' })).toBeNull()
  })

  it('removes only the clicked chip', () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <MultiSelectAutocomplete
        value={[options[0], options[1]]}
        options={options}
        onChange={handleChange}
        ariaLabel="Compare plans"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove Harbor plan' }))

    expect(handleChange).toHaveBeenCalledWith(
      expect.anything(),
      [options[0]]
    )
  })

  it('removes the focused chip with Backspace', () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <MultiSelectAutocomplete
        value={[options[0], options[1]]}
        options={options}
        onChange={handleChange}
        ariaLabel="Compare plans"
      />
    )

    const chip = screen
      .getByRole('button', { name: 'Remove Harbor plan' })
      .closest('[data-slot="chip"]') as HTMLElement
    chip.focus()
    fireEvent.keyDown(chip, { key: 'Backspace' })

    expect(handleChange).toHaveBeenCalledWith(
      expect.anything(),
      [options[0]]
    )
  })

  it('toggles a selected option from the open list', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <MultiSelectAutocomplete
        value={[options[0], options[1]]}
        options={options}
        onChange={handleChange}
        ariaLabel="Compare plans"
        defaultOpen
      />
    )

    fireEvent.click(await screen.findByRole('option', { name: 'Harbor plan' }))

    expect(handleChange).toHaveBeenCalledWith(
      expect.anything(),
      [options[0]]
    )
  })

  it('renders no-results text for an open empty filtered list', async () => {
    renderWithTheme(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Compare plans"
        defaultOpen
        defaultInputValue="zzz"
      />
    )

    expect(
      await screen.findByText('components.autocomplete.no_results')
    ).toBeVisible()
  })

  it('closes the option list when pointer interaction moves outside', async () => {
    renderWithTheme(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Compare plans"
        defaultOpen
      />
    )

    expect(await screen.findByRole('listbox')).toBeVisible()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the option list when Escape is pressed', async () => {
    renderWithTheme(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Compare plans"
        defaultOpen
      />
    )

    expect(await screen.findByRole('listbox')).toBeVisible()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
