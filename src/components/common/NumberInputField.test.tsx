import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import { SHARED_CONTROL_INFINITE_BORDER_RADIUS } from '#/common/style/theme/constants'
import { NumberInputField } from '#/components/common/NumberInputField'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) =>
      key === 'components.number_input.increase'
        ? 'Increase'
        : key === 'components.number_input.decrease'
          ? 'Decrease'
          : key,
  }),
}))

jest.mock('#/common/navigation/navigation', () => ({
  useAppParams: () => ({ locale: 'en' }),
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<AppThemeProvider>{ui}</AppThemeProvider>)

describe('NumberInputField', () => {
  it('preserves keyboard stepping and blur commits in raw editing mode', async () => {
    const onCommitted = jest.fn()

    const RawValueExample = () => {
      const [rawValue, setRawValue] = React.useState('12')
      const value = /^\d+$/.test(rawValue) ? Number(rawValue) : 12

      return (
        <NumberInputField
          label="Count"
          value={value}
          rawValue={rawValue}
          onRawValueChange={setRawValue}
          onRawValueCommitted={(nextValue, event) => {
            onCommitted(nextValue, event)
            setRawValue(/^\d+$/.test(nextValue) ? nextValue : '12')
          }}
          onValueChange={(nextValue) => {
            setRawValue(nextValue == null ? '' : String(nextValue))
          }}
        />
      )
    }

    renderWithTheme(<RawValueExample />)

    const input = screen.getByLabelText('Count')
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })

    await waitFor(() => {
      expect(input).toHaveValue('13')
    })

    fireEvent.keyDown(input, { key: 'ArrowDown' })

    await waitFor(() => {
      expect(input).toHaveValue('12')
    })

    fireEvent.change(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: 'abc' } })

    expect(input).toHaveValue('abc')

    fireEvent.blur(input)

    expect(onCommitted).toHaveBeenCalledWith(
      'abc',
      expect.objectContaining({ target: input })
    )

    await waitFor(() => {
      expect(input).toHaveValue('12')
    })
  })

  it('normalizes controlled values that are near the active step', () => {
    renderWithTheme(
      <NumberInputField
        label="Decimal"
        value={0.30000000000000004}
        step={0.1}
        locale="en-US"
        onValueChange={() => {}}
      />
    )

    expect(screen.getByLabelText('Decimal')).toHaveValue('0.3')
  })

  it('preserves controlled off-step values', () => {
    renderWithTheme(
      <NumberInputField
        label="Decimal"
        value={0.31}
        step={0.1}
        locale="en-US"
        onValueChange={() => {}}
      />
    )

    expect(screen.getByLabelText('Decimal')).toHaveValue('0.31')
  })

  it('updates the displayed input when the controlled value changes', async () => {
    const { rerender } = renderWithTheme(
      <NumberInputField
        label="Count"
        value={1}
        locale="en-US"
        onValueChange={() => {}}
      />
    )

    expect(screen.getByLabelText('Count')).toHaveValue('1')

    rerender(
      <AppThemeProvider>
        <NumberInputField
          label="Count"
          value={4.5}
          locale="en-US"
          onValueChange={() => {}}
        />
      </AppThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Count')).toHaveValue('4.5')
    })
  })

  it('calls onValueChange with the incremented value from the stepper', async () => {
    const handleValueChange = jest.fn()

    renderWithTheme(
      <NumberInputField
        label="Amount"
        value={2}
        step={0.5}
        locale="en-US"
        onValueChange={handleValueChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Increase' }))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledWith(2.5, expect.anything())
    })
  })

  it('calls onValueChange with the decremented value from the stepper', async () => {
    const handleValueChange = jest.fn()

    renderWithTheme(
      <NumberInputField
        label="Amount"
        value={2}
        step={0.5}
        locale="en-US"
        onValueChange={handleValueChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledWith(1.5, expect.anything())
    })
  })

  it('disables increment and decrement at min and max boundaries', () => {
    renderWithTheme(
      <NumberInputField
        label="Amount"
        value={10}
        min={10}
        max={10}
        locale="en-US"
        onValueChange={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
  })

  it('associates helper text and error state with the input', () => {
    renderWithTheme(
      <NumberInputField
        error
        helperText="Enter a valid value."
        label="Amount"
        value={12}
        locale="en-US"
        onValueChange={() => {}}
      />
    )

    const input = screen.getByLabelText('Amount')
    const helper = screen.getByText('Enter a valid value.')

    expect(helper).toHaveAttribute('id')
    expect(input).toHaveAttribute('aria-describedby', helper.id)
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('uses the shared pill radius for the single-line number control', () => {
    renderWithTheme(
      <NumberInputField
        label="Amount"
        value={12}
        locale="en-US"
        onValueChange={() => {}}
      />
    )

    const control = screen
      .getByLabelText('Amount')
      .closest('[data-slot="number-input-control"]')

    expect(control).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })
  })

  it.each([
    {
      size: 'medium' as const,
      arrowWidth: '9px',
      arrowHeight: '6px',
      controlHeight: 'calc(2rem / 2)',
      adornmentWidth: '1.75rem',
    },
    {
      size: 'small' as const,
      arrowWidth: '8px',
      arrowHeight: '5px',
      controlHeight: 'calc(1.5rem / 2)',
      adornmentWidth: '1.5rem',
    },
  ])(
    'offsets only the $size arrow glyphs while preserving stepper hit areas',
    ({
      size,
      arrowWidth,
      arrowHeight,
      controlHeight,
      adornmentWidth,
    }) => {
      renderWithTheme(
        <NumberInputField
          size={size}
          label={`${size} amount`}
          value={5}
          locale="en-US"
          onValueChange={() => {}}
        />
      )

      const increment = screen.getByRole('button', { name: 'Increase' })
      const decrement = screen.getByRole('button', { name: 'Decrease' })
      const incrementArrow = increment.querySelector('svg')
      const decrementArrow = decrement.querySelector('svg')
      const adornment = increment.closest(
        '[data-slot="number-input-adornment"]'
      )

      expect(incrementArrow).toHaveStyle({
        width: arrowWidth,
        height: arrowHeight,
        transform: 'translateX(-1px)',
      })
      expect(decrementArrow).toHaveStyle({
        width: arrowWidth,
        height: arrowHeight,
        transform: 'translate(-1px, -1px)',
      })
      expect(increment).toHaveStyle({
        width: '100%',
        minWidth: '100%',
        height: controlHeight,
        minHeight: controlHeight,
      })
      expect(decrement).toHaveStyle({
        width: '100%',
        minWidth: '100%',
        height: controlHeight,
        minHeight: controlHeight,
      })
      expect(adornment).toHaveStyle({
        width: adornmentWidth,
        minWidth: adornmentWidth,
      })
    }
  )
})
