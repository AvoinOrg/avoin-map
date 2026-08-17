import React, { useState } from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import { SHARED_CONTROL_INFINITE_BORDER_RADIUS } from '#/common/style/theme/constants'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

describe('TextFieldWithLabel', () => {
  it('looks up the input by visible or aria label', () => {
    renderWithTheme(
      <TextFieldWithLabel
        label="Plan name"
        ariaLabel="Plan name input"
        value=""
        onChange={() => {}}
      />
    )

    expect(screen.getByRole('textbox', { name: 'Plan name input' })).toBeInTheDocument()
    expect(screen.getByText('Plan name')).toBeInTheDocument()
  })

  it('updates controlled value through native change events', () => {
    const onChange = jest.fn()
    const ControlledTextField = () => {
      const [value, setValue] = useState('')

      return (
        <TextFieldWithLabel
          label="Status"
          ariaLabel="Status"
          value={value}
          onChange={(event) => {
            onChange(event)
            setValue(event.target.value)
          }}
        />
      )
    }

    renderWithTheme(<ControlledTextField />)

    const input = screen.getByRole('textbox', { name: 'Status' })
    fireEvent.change(input, { target: { value: 'Ready' } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect((input as HTMLInputElement).value).toBe('Ready')
  })

  it('blurs single-line input on Enter after invoking caller onKeyDown', () => {
    const onKeyDown = jest.fn()

    renderWithTheme(
      <TextFieldWithLabel
        label="Code"
        ariaLabel="Code input"
        value=""
        onChange={() => {}}
        onKeyDown={onKeyDown}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Code input' })
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(document.activeElement).not.toBe(input)
  })

  it('respects caller onKeyDown defaultPrevented for Enter blur behavior', () => {
    const onBlur = jest.fn()
    const onKeyDown = jest.fn((event: React.KeyboardEvent) => {
      event.preventDefault()
    })

    renderWithTheme(
      <TextFieldWithLabel
        label="Code"
        ariaLabel="Code prevent"
        value=""
        onChange={() => {}}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Code prevent' })
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onBlur).not.toHaveBeenCalled()
  })

  it('supports disabled/error/helper/required props', () => {
    renderWithTheme(
      <TextFieldWithLabel
        label="Name"
        ariaLabel="Name input"
        value=""
        onChange={() => {}}
        disabled
        error
        required
        helperText="Name is required"
      />
    )

    const input = screen.getByRole('textbox', { name: 'Name input' })

    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('note')).toHaveTextContent('Name is required')
  })

  it('uses the shared pill radius for single-line inputs', () => {
    renderWithTheme(
      <TextFieldWithLabel
        label="Name"
        ariaLabel="Name input radius"
        value=""
        onChange={() => {}}
      />
    )

    expect(screen.getByRole('textbox', { name: 'Name input radius' }))
      .toHaveStyle({
        borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
      })
  })
})
