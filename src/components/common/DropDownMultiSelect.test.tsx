import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import {
  SHARED_CONTROL_BORDER_RADIUS,
  SHARED_CONTROL_INFINITE_BORDER_RADIUS,
  SHARED_PILL_HORIZONTAL_CONTENT_INSET,
} from '#/common/style/theme/constants'
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

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Layer filters' }))
    const option = await screen.findByRole('option', {
      name: 'Solar potential',
    })

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

  it('closes the option list from an open trigger click', async () => {
    renderWithTheme(
      <DropDownMultiSelect
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Closable layer filters"
        defaultOpen
      />
    )

    const trigger = screen.getByRole('combobox', {
      name: 'Closable layer filters',
    })

    expect(
      await screen.findByRole('option', { name: 'Heat demand' })
    ).toBeVisible()

    fireEvent.click(trigger)

    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
    })
  })

  it('uses the shared seamless outline element', () => {
    renderWithTheme(
      <DropDownMultiSelect
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Outlined layer filters"
      />
    )

    const trigger = screen.getByRole('combobox', {
      name: 'Outlined layer filters',
    })
    const outline = trigger.querySelector('.MuiOutlinedInput-notchedOutline')

    expect(trigger).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })
    expect(outline?.tagName).toBe('SPAN')
    expect(outline).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })
    expect(outline?.querySelector('legend')).toBeNull()
  })

  it('shares arrow inset and opt-in geometry with the single select', () => {
    renderWithTheme(
      <>
        <DropDownMultiSelect
          value={['heat']}
          options={options}
          onChange={() => {}}
          ariaLabel="Default multi geometry"
        />
        <DropDownMultiSelect
          value={['heat']}
          options={options}
          onChange={() => {}}
          ariaLabel="Negative multi geometry"
          applyNegativeMargins
        />
        <DropDownMultiSelect
          value={['heat']}
          options={options}
          onChange={() => {}}
          ariaLabel="Overridden multi geometry"
          applyNegativeMargins
          selectSx={{ mx: '-0.25rem', width: '75%' }}
        />
      </>
    )

    const defaultTrigger = screen.getByRole('combobox', {
      name: 'Default multi geometry',
    })
    const negativeTrigger = screen.getByRole('combobox', {
      name: 'Negative multi geometry',
    })
    const overriddenTrigger = screen.getByRole('combobox', {
      name: 'Overridden multi geometry',
    })

    expect(defaultTrigger).toHaveStyle({ margin: '0px', width: '100%' })
    expect(defaultTrigger.querySelector('[data-slot="icon"]')).toHaveStyle({
      right: SHARED_PILL_HORIZONTAL_CONTENT_INSET,
    })
    expect(negativeTrigger).toHaveStyle({
      marginLeft: '-1rem',
      marginRight: '-1rem',
      width: 'calc(100% + 2rem)',
    })
    expect(overriddenTrigger).toHaveStyle({
      marginLeft: '-0.25rem',
      marginRight: '-0.25rem',
      width: '75%',
    })
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

  it('clips the rounded popup while the list owns scrolling', async () => {
    renderWithTheme(
      <DropDownMultiSelect
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Scrollable layer filters"
        defaultOpen
      />
    )

    const option = await screen.findByRole('option', { name: 'Heat demand' })
    const popup = document.querySelector('[data-slot="popup"]')
    const list = document.querySelector('[data-slot="list"]')

    expect(popup).toHaveStyle({
      borderRadius: SHARED_CONTROL_BORDER_RADIUS,
      overflow: 'hidden',
    })
    expect(list).toHaveStyle({
      maxHeight: 'min(18rem, calc(100vh - 2rem))',
      overflowY: 'auto',
    })
    expect(list?.parentElement).toBe(popup)
    expect(option.parentElement).toBe(list)
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

  it('renders checkbox icons for selected and unchecked options', async () => {
    renderWithTheme(
      <DropDownMultiSelect
        value={['heat']}
        options={options}
        onChange={() => {}}
        ariaLabel="Icon layer filters"
        defaultOpen
      />
    )

    const selectedOption = await screen.findByRole('option', {
      name: 'Heat demand',
    })
    const uncheckedOption = await screen.findByRole('option', {
      name: 'Solar potential',
    })

    expect(selectedOption.querySelector('svg path')).toBeInTheDocument()
    expect(uncheckedOption.querySelector('svg')).toBeInTheDocument()
    expect(uncheckedOption.querySelector('svg path')).not.toBeInTheDocument()
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
