import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import CheckBoxWithLabel from './CheckBoxWithLabel'

describe('CheckBoxWithLabel', () => {
  it('uses visible text as the accessible checkbox name', () => {
    render(
      <CheckBoxWithLabel checked={false} onChange={() => {}}>
        Include forests
      </CheckBoxWithLabel>
    )

    expect(
      screen.getByRole('checkbox', { name: 'Include forests' })
    ).toBeInTheDocument()
  })

  it('calls onChange with the next checked state on click', () => {
    const onChange = jest.fn()

    render(
      <CheckBoxWithLabel checked={false} onChange={onChange} name="include">
        Include forests
      </CheckBoxWithLabel>
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Include forests' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.checked).toBe(true)
    expect(onChange.mock.calls[0][0].target.name).toBe('include')
    expect(onChange.mock.calls[0][1]).toBe(true)
  })

  it('preserves explicit aria labels, required marker, and disabled state', () => {
    render(
      <CheckBoxWithLabel
        checked
        disabled
        required
        inputProps={{ 'aria-label': 'Explicit checkbox' }}
        onChange={() => {}}
      >
        <span>Visible label</span>
      </CheckBoxWithLabel>
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Explicit checkbox' })
    expect(checkbox).toHaveAttribute('aria-disabled', 'true')
    expect(checkbox.closest('label')).toHaveTextContent('*')
  })
})
