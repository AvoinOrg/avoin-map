import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import MultiSelectAutocomplete from './MultiSelectAutocomplete'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

const options = [
  { value: 'plan-a', label: 'Plan A' },
  { value: 'plan-b', label: 'Plan B' },
]

describe('MultiSelectAutocomplete', () => {
  it('renders selected chips and removes a chip', () => {
    const onChange = jest.fn()

    render(
      <MultiSelectAutocomplete
        value={[options[0]]}
        options={options}
        onChange={onChange}
        placeholder="Compare plans"
      />
    )

    expect(screen.getByText('Plan A')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove Plan A' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toEqual([])
  })

  it('opens options and selects an option', () => {
    const onChange = jest.fn()

    render(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={onChange}
        ariaLabel="Plan comparison"
      />
    )

    const input = screen.getByRole('combobox', { name: 'Plan comparison' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Plan B' } })
    fireEvent.click(screen.getByRole('option', { name: 'Plan B' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toEqual([options[1]])
  })

  it('shows no-results text for an unmatched filter', () => {
    render(
      <MultiSelectAutocomplete
        value={[]}
        options={options}
        onChange={() => {}}
        ariaLabel="Plan comparison"
      />
    )

    const input = screen.getByRole('combobox', { name: 'Plan comparison' })
    fireEvent.change(input, { target: { value: 'missing' } })

    expect(screen.getByText('components.autocomplete.no_results'))
      .toBeInTheDocument()
  })
})
