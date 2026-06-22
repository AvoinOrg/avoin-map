import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
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
})
