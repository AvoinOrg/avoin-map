import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { NumberInputField } from './NumberInputField'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

jest.mock('#/common/hooks/useLocaleFormatter', () => ({
  useLocaleFormatter: () => ({
    numberLocale: 'en-US',
  }),
}))

describe('NumberInputField', () => {
  it('renders label, helper, and error state', () => {
    render(
      <NumberInputField
        label="Buffer"
        helperText="Meters"
        value={5}
        onValueChange={() => {}}
        error
      />
    )

    expect(screen.getByLabelText('Buffer')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    expect(screen.getByText('Meters')).toBeInTheDocument()
  })

  it('increments and decrements values', () => {
    const onValueChange = jest.fn()

    render(
      <NumberInputField
        value={5}
        min={0}
        max={10}
        step={1}
        onValueChange={onValueChange}
        inputSlotProps={{ 'aria-label': 'Buffer' }}
      />
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'components.number_input.increase',
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'components.number_input.decrease',
      })
    )

    expect(onValueChange).toHaveBeenCalled()
  })

  it('disables input and stepper buttons', () => {
    render(
      <NumberInputField
        value={5}
        disabled
        onValueChange={() => {}}
        inputSlotProps={{ 'aria-label': 'Buffer' }}
      />
    )

    expect(screen.getByRole('textbox', { name: 'Buffer' })).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'components.number_input.increase',
      })
    ).toBeDisabled()
  })
})
