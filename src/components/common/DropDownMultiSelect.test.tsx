import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DropDownMultiSelect from './DropDownMultiSelect'

describe('DropDownMultiSelect', () => {
  it('renders placeholder and emits string array changes', () => {
    const onChange = jest.fn()

    render(
      <DropDownMultiSelect
        ariaLabel="Filter classes"
        value={[]}
        onChange={onChange}
        placeholder="All classes"
        options={[
          { value: 'ak', label: 'AK' },
          { value: 'vp', label: 'VP', ariaLabel: 'Park' },
        ]}
      />
    )

    const trigger = screen.getByRole('combobox', { name: 'Filter classes' })
    expect(trigger).toHaveTextContent('All classes')

    fireEvent.click(trigger)
    const parkOption = screen.getByRole('option', { name: 'Park' })
    fireEvent.mouseMove(parkOption)
    fireEvent.click(parkOption)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.value).toEqual(['vp'])
  })

  it('supports custom selected and option rendering', () => {
    render(
      <DropDownMultiSelect
        ariaLabel="Filter classes"
        value={['ak']}
        onChange={() => {}}
        options={[{ value: 'ak', label: 'AK' }]}
        renderValue={(selected) => `Selected ${selected.length}`}
        renderOptionContent={(option, selected) => (
          <span>{`${option.value}:${selected ? 'yes' : 'no'}`}</span>
        )}
      />
    )

    expect(screen.getByRole('combobox', { name: 'Filter classes' }))
      .toHaveTextContent('Selected 1')

    fireEvent.click(screen.getByRole('combobox', { name: 'Filter classes' }))
    expect(screen.getByRole('option', { name: 'AK' })).toHaveTextContent('ak:yes')
  })

  it('disables the trigger', () => {
    render(
      <DropDownMultiSelect
        ariaLabel="Filter classes"
        disabled
        value={[]}
        onChange={() => {}}
        options={[{ value: 'ak', label: 'AK' }]}
      />
    )

    expect(
      screen.getByRole('combobox', { name: 'Filter classes' })
    ).toBeDisabled()
  })
})
