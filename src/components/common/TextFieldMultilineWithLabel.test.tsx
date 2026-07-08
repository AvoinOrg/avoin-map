import React, { useState } from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import TextFieldMultilineWithLabel from '#/components/common/TextFieldMultilineWithLabel'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

describe('TextFieldMultilineWithLabel', () => {
  it('renders a textarea by visible or aria label', () => {
    renderWithTheme(
      <TextFieldMultilineWithLabel
        label="Description"
        ariaLabel="Description input"
        value="Line one"
        onChange={() => {}}
      />
    )

    const textarea = screen.getByRole('textbox', { name: 'Description input' })

    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea).toHaveValue('Line one')
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('updates controlled value through native textarea change events', () => {
    const onChange = jest.fn()
    const ControlledTextField = () => {
      const [value, setValue] = useState('')

      return (
        <TextFieldMultilineWithLabel
          label="Notes"
          ariaLabel="Notes"
          value={value}
          onChange={(event) => {
            onChange(event)
            setValue(event.target.value)
          }}
        />
      )
    }

    renderWithTheme(<ControlledTextField />)

    const textarea = screen.getByRole('textbox', { name: 'Notes' })
    fireEvent.change(textarea, { target: { value: 'Line one\nLine two' } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(textarea).toHaveValue('Line one\nLine two')
  })

  it('supports rows and keeps Enter behavior inside the textarea', () => {
    const onBlur = jest.fn()
    const onKeyDown = jest.fn()

    renderWithTheme(
      <TextFieldMultilineWithLabel
        label="Description"
        ariaLabel="Description input"
        rows={3}
        value=""
        onChange={() => {}}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    )

    const textarea = screen.getByRole('textbox', { name: 'Description input' })
    fireEvent.focus(textarea)
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
    })

    expect(textarea).toHaveAttribute('rows', '3')
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onBlur).not.toHaveBeenCalled()
  })

  it('supports disabled/error/helper/required props', () => {
    renderWithTheme(
      <TextFieldMultilineWithLabel
        label="Description"
        ariaLabel="Description input"
        value=""
        onChange={() => {}}
        disabled
        error
        required
        helperText="Description is required"
      />
    )

    const textarea = screen.getByRole('textbox', { name: 'Description input' })

    expect(textarea).toBeDisabled()
    expect(textarea).toHaveAttribute('required')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('note')).toHaveTextContent(
      'Description is required'
    )
  })
})
