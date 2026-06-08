import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DropDownSelect from './DropDownSelect'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

describe('DropDownSelect', () => {
  it('renders placeholder and opens options', () => {
    render(
      <DropDownSelect
        value=""
        options={options}
        onChange={() => {}}
        placeholder="Choose option"
        ariaLabel="Choose"
      />
    )

    const trigger = screen.getByRole('combobox', { name: 'Choose' })
    expect(trigger).toHaveTextContent('Choose option')

    fireEvent.click(trigger)

    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument()
  })

  it('synthesizes event.target.value when an option is selected', () => {
    const onChange = jest.fn()

    render(
      <DropDownSelect
        value=""
        options={options}
        onChange={onChange}
        ariaLabel="Choose"
        name="choice"
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Choose' }))
    const betaOption = screen.getByRole('option', { name: 'Beta' })
    fireEvent.mouseMove(betaOption)
    fireEvent.click(betaOption)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.value).toBe('b')
    expect(onChange.mock.calls[0][0].target.name).toBe('choice')
  })

  it('renders empty and invalid-value items', () => {
    render(
      <DropDownSelect
        value="missing"
        options={options}
        onChange={() => {}}
        allowEmpty
        ariaLabel="Choose"
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Choose' }))

    expect(screen.getByRole('option', { name: 'Invalid value missing' }))
      .toHaveTextContent('components.drop_down_select.invalid_value')
    expect(screen.getByRole('option', { name: 'Empty selection' }))
      .toHaveTextContent('components.drop_down_select.empty_selection')
  })

  it('renders custom selected value and outside success indicator', () => {
    render(
      <DropDownSelect
        value="a"
        options={options}
        onChange={() => {}}
        ariaLabel="Choose"
        renderSelectedValue={(option) => `Selected ${option?.label}`}
        successIndicatorMode="outside"
      />
    )

    expect(screen.getByRole('combobox', { name: 'Choose' }))
      .toHaveTextContent('Selected Alpha')
  })
})
