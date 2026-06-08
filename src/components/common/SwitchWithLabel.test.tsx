import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import SwitchWithLabel from './SwitchWithLabel'

describe('SwitchWithLabel', () => {
  it('uses visible text as the accessible switch name', () => {
    render(
      <SwitchWithLabel checked={false} onChange={() => {}}>
        Buildings
      </SwitchWithLabel>
    )

    expect(screen.getByRole('switch', { name: 'Buildings' })).toBeInTheDocument()
  })

  it('calls onChange with event.target.checked', () => {
    const onChange = jest.fn()

    render(
      <SwitchWithLabel checked={false} name="buildings" onChange={onChange}>
        Buildings
      </SwitchWithLabel>
    )

    fireEvent.click(screen.getByRole('switch', { name: 'Buildings' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.checked).toBe(true)
    expect(onChange.mock.calls[0][0].target.name).toBe('buildings')
  })

  it('supports explicit aria labels, disabled state, and required marker', () => {
    render(
      <SwitchWithLabel
        checked
        disabled
        required
        ariaLabel="Explicit switch"
        onChange={() => {}}
      >
        <span>Visible label</span>
      </SwitchWithLabel>
    )

    const switchControl = screen.getByRole('switch', { name: 'Explicit switch' })
    expect(switchControl).toHaveAttribute('aria-disabled', 'true')
    expect(switchControl.closest('label')).toHaveTextContent('*')
  })
})
