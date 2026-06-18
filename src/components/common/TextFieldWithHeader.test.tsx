import React from 'react'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

describe('TextFieldWithHeader', () => {
  it('renders initial value from parent', () => {
    renderWithTheme(
      <TextFieldWithHeader
        headerText="Area name"
        value="Default"
        onChange={() => {}}
        placeholderText="Type a name"
      />
    )

    expect(screen.getByRole('textbox', { name: 'Area name' })).toHaveValue(
      'Default'
    )
  })

  it('updates visible value immediately while debouncing parent updates', () => {
    const onChange = jest.fn()
    renderWithTheme(
      <TextFieldWithHeader
        headerText="Area name"
        value=""
        onChange={onChange}
        placeholderText="Type a name"
      />
    )

    jest.useFakeTimers()

    const input = screen.getByRole('textbox', { name: 'Area name' })
    fireEvent.change(input, { target: { value: 'A' } })

    expect(input).toHaveValue('A')
    expect(onChange).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(onChange).toHaveBeenCalledWith('A')

    jest.useRealTimers()
  })

  it('calls parent onChange with the latest value only', () => {
    const onChange = jest.fn()

    jest.useFakeTimers()

    renderWithTheme(
      <TextFieldWithHeader
        headerText="Area name"
        value=""
        onChange={onChange}
        placeholderText="Type a name"
      />
    )

    const input = screen.getByRole('textbox', { name: 'Area name' })
    fireEvent.change(input, { target: { value: 'A' } })
    fireEvent.change(input, { target: { value: 'AB' } })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith('AB')

    jest.useRealTimers()
  })

  it('syncs visible value when parent value changes', () => {
    const { rerender } = renderWithTheme(
      <TextFieldWithHeader
        headerText="Area name"
        value="Initial"
        onChange={() => {}}
        placeholderText="Type a name"
      />
    )

    const input = screen.getByRole('textbox', { name: 'Area name' })
    expect(input).toHaveValue('Initial')

    rerender(
      <AppThemeProvider>
        <TextFieldWithHeader
          headerText="Area name"
          value="Updated"
          onChange={() => {}}
          placeholderText="Type a name"
        />
      </AppThemeProvider>
    )

    expect(input).toHaveValue('Updated')
  })

  it('cancels pending debounced update on unmount', () => {
    const onChange = jest.fn()

    jest.useFakeTimers()

    const { unmount } = renderWithTheme(
      <TextFieldWithHeader
        headerText="Area name"
        value=""
        onChange={onChange}
        placeholderText="Type a name"
      />
    )

    const input = screen.getByRole('textbox', { name: 'Area name' })
    fireEvent.change(input, { target: { value: 'pending' } })
    unmount()

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(onChange).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('supports multiline with row attribute', () => {
    renderWithTheme(
      <TextFieldWithHeader
        headerText="Description"
        value=""
        onChange={() => {}}
        placeholderText="Type a description"
        multiline
        rows={15}
      />
    )

    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveAttribute(
      'rows',
      '15'
    )
  })
})
