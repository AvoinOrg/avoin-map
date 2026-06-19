import React from 'react'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import EditableText from '#/components/common/EditableText'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

describe('EditableText', () => {
  it('renders value and appendix in display mode', () => {
    renderWithTheme(
      <EditableText
        value="Base value"
        valueAppendix=" units"
        onChange={jest.fn()}
      />
    )

    expect(screen.getByText('Base value units')).toBeInTheDocument()
  })

  it('enters edit mode when clicking edit button', () => {
    renderWithTheme(<EditableText value="Plan" onChange={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))

    expect(screen.getByRole('textbox', { name: 'Editable text' })).toBeInTheDocument()
  })

  it('enters edit mode by keyboard Enter', () => {
    renderWithTheme(<EditableText value="Plan" onChange={jest.fn()} />)

    const editButton = screen.getByRole('button', { name: 'Edit text' })
    fireEvent.keyDown(editButton, { key: 'Enter' })

    expect(screen.getByRole('textbox', { name: 'Editable text' })).toBeInTheDocument()
  })

  it('enters edit mode by keyboard Space', () => {
    renderWithTheme(<EditableText value="Plan" onChange={jest.fn()} />)

    const editButton = screen.getByRole('button', { name: 'Edit text' })
    fireEvent.keyDown(editButton, { key: ' ' })

    expect(screen.getByRole('textbox', { name: 'Editable text' })).toBeInTheDocument()
  })

  it('does not call onChange while typing in the input draft', () => {
    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))

    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(input, { target: { value: 'Draft plan' } })

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('commits on save click using event-like payload', () => {
    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Editable text' }), {
      target: { value: 'Draft plan' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save text' }))

    expect(
      screen.queryByRole('textbox', { name: 'Editable text' })
    ).not.toBeInTheDocument()
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith({ target: { value: 'Draft plan' } })
  })

  it('commits on Enter with event-like payload', () => {
    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Editable text' }), {
      target: { value: 'Draft plan' },
    })

    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(
      screen.queryByRole('textbox', { name: 'Editable text' })
    ).not.toBeInTheDocument()
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith({ target: { value: 'Draft plan' } })
  })

  it('keeps edit mode when immediately entering edit mode again after save click', () => {
    jest.useFakeTimers()

    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))

    const saveInput = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(saveInput, { target: { value: 'Saved plan' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save text' }))

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    expect(screen.getByRole('textbox', { name: 'Editable text' })).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(screen.getByRole('textbox', { name: 'Editable text' })).toBeInTheDocument()
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith({ target: { value: 'Saved plan' } })

    jest.useRealTimers()
  })

  it('keeps edit mode when immediately entering edit mode again after cancel click', () => {
    jest.useFakeTimers()

    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))

    const cancelInput = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(cancelInput, { target: { value: 'Draft plan' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel text editing' }))

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    expect(screen.getByRole('textbox', { name: 'Editable text' })).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(screen.getByRole('textbox', { name: 'Editable text' })).toBeInTheDocument()
    expect(handleChange).not.toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('commits after controlled Enter-save and then blur-save in next edit without stale pending flag', () => {
    jest.useFakeTimers()

    const handleChange = jest.fn()

    const ControlledEditableText = () => {
      const [value, setValue] = React.useState('Plan')

      return (
        <EditableText
          value={value}
          onChange={(event) => {
            handleChange(event)
            setValue(event.target.value)
          }}
        />
      )
    }

    renderWithTheme(<ControlledEditableText />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    const firstInput = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(firstInput, { target: { value: 'One' } })
    fireEvent.keyDown(firstInput, { key: 'Enter' })

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith({ target: { value: 'One' } })

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    const secondInput = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(secondInput, { target: { value: 'Two' } })
    fireEvent.blur(secondInput)

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(handleChange).toHaveBeenCalledTimes(2)
    expect(handleChange).toHaveBeenNthCalledWith(2, { target: { value: 'Two' } })
    expect(screen.getByText('Two')).toBeInTheDocument()

    jest.useRealTimers()
  })

  it('commits on blur after the delayed blur timeout', () => {
    const handleChange = jest.fn()

    jest.useFakeTimers()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))

    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(input, { target: { value: 'Draft plan' } })
    fireEvent.blur(input)

    expect(handleChange).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith({ target: { value: 'Draft plan' } })

    jest.useRealTimers()
  })

  it('cancels and restores original value without calling onChange', () => {
    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))

    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.change(input, { target: { value: 'Draft plan' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel text editing' }))

    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.getByText('Plan')).toBeInTheDocument()
  })

  it('does not commit when save has no draft changes', () => {
    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save text' }))

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('does not commit on Enter when draft is unchanged', () => {
    const handleChange = jest.fn()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))

    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('does not commit on blur when draft is unchanged', () => {
    const handleChange = jest.fn()

    jest.useFakeTimers()

    renderWithTheme(<EditableText value="Plan" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    fireEvent.blur(screen.getByRole('textbox', { name: 'Editable text' }))

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(handleChange).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('resets draft value when controlled value updates', () => {
    const handleChange = jest.fn()

    const { rerender } = renderWithTheme(<EditableText value="First" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Editable text' }), {
      target: { value: 'Draft plan' },
    })

    rerender(
      <AppThemeProvider>
        <EditableText value="Second" onChange={handleChange} />
      </AppThemeProvider>
    )

    expect(screen.getByRole('textbox', { name: 'Editable text' })).toHaveValue('Second')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('prevents propagation for edit, click, and action interactions', () => {
    const handleParentClick = jest.fn()
    const handleParentFocus = jest.fn()

    const handleChange = jest.fn()

    renderWithTheme(
      <div onClick={handleParentClick} onFocus={handleParentFocus}>
        <EditableText value="Plan" onChange={handleChange} />
      </div>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit text' }))
    expect(handleParentClick).not.toHaveBeenCalled()

    const input = screen.getByRole('textbox', { name: 'Editable text' })
    fireEvent.click(input)
    fireEvent.focus(input)

    expect(handleParentFocus).not.toHaveBeenCalled()
    expect(handleParentClick).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: 'Draft plan' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save text' }))

    expect(handleParentClick).not.toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith({ target: { value: 'Draft plan' } })
  })
})
