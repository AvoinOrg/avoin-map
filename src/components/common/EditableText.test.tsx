import '#/test/baseUiTestPolyfills'
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'

import EditableText from './EditableText'

describe('EditableText', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('enters edit mode and commits with Enter', () => {
    const onChange = jest.fn()

    render(<EditableText value="Original" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(input, { target: { value: 'Changed' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange.mock.calls[0][0].target.value).toBe('Changed')
  })

  it('cancels and restores the original value', () => {
    const onChange = jest.fn()

    render(<EditableText value="Original" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Editable text' }), {
      target: { value: 'Changed' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel text editing' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('Original')).toBeInTheDocument()
  })

  it('commits changed values after blur delay', () => {
    const onChange = jest.fn()

    render(<EditableText value="Original" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(input, { target: { value: 'Blurred' } })
    fireEvent.blur(input)

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(onChange.mock.calls[0][0].target.value).toBe('Blurred')
  })
})
