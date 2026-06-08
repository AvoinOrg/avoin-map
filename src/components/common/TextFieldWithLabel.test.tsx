import '#/test/baseUiTestPolyfills'
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'

import TextFieldWithLabel from './TextFieldWithLabel'

describe('TextFieldWithLabel', () => {
  it('renders label, trailing content, and calls onChange', () => {
    const onChange = jest.fn()

    render(
      <TextFieldWithLabel
        label="Plan name"
        ariaLabel="Plan name input"
        value="A"
        onChange={onChange}
        trailing={<button type="button">Open</button>}
      />
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Plan name input' }), {
      target: { value: 'B' },
    })

    expect(onChange).toHaveBeenCalled()
    expect(screen.getByText('Plan name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('blurs single-line inputs on Enter', () => {
    render(
      <TextFieldWithLabel
        label="Plan name"
        ariaLabel="Plan name input"
        defaultValue="A"
      />
    )

    const input = screen.getByRole('textbox', { name: 'Plan name input' })
    act(() => {
      input.focus()
    })
    expect(input).toHaveFocus()

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(input).not.toHaveFocus()
  })
})
