import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DropDownSelectMinimal from './DropDownSelectMinimal'

describe('DropDownSelectMinimal', () => {
  it('renders an accessible compact select and emits selected value', () => {
    const onChange = jest.fn()

    render(
      <DropDownSelectMinimal
        ariaLabel="Sort plans"
        value="newest"
        onChange={onChange}
        options={[
          { value: 'newest', label: 'Newest' },
          { value: 'oldest', label: 'Oldest' },
        ]}
      />
    )

    const trigger = screen.getByRole('combobox', { name: 'Sort plans' })
    expect(trigger).toHaveTextContent('Newest')

    fireEvent.click(trigger)
    const oldestOption = screen.getByRole('option', { name: 'Oldest' })
    fireEvent.mouseMove(oldestOption)
    fireEvent.click(oldestOption)

    expect(onChange.mock.calls[0][0].target.value).toBe('oldest')
  })
})
