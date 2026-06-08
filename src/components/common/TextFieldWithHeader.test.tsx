import '#/test/baseUiTestPolyfills'
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'

import TextFieldWithHeader from './TextFieldWithHeader'

describe('TextFieldWithHeader', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('updates locally immediately and debounces parent changes', () => {
    const onChange = jest.fn()

    render(
      <TextFieldWithHeader
        headerText="Name"
        value="Old"
        onChange={onChange}
        debounceTimeout={200}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Name' })
    fireEvent.change(input, { target: { value: 'New' } })

    expect(input).toHaveValue('New')
    expect(onChange).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(onChange).toHaveBeenCalledWith('New')
  })

  it('renders helper, error, disabled, and multiline states', () => {
    render(
      <TextFieldWithHeader
        headerText="Description"
        value="Text"
        onChange={() => {}}
        helperText="Required"
        error
        disabled
        multiline
        rows={3}
      />
    )

    const textarea = screen.getByRole('textbox', { name: 'Description' })
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
