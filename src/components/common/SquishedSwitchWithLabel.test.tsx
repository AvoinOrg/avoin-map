import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import SquishedSwitchWithLabel from '#/components/common/SquishedSwitchWithLabel'

describe('SquishedSwitchWithLabel', () => {
  it('uses a visible text label as the accessible switch name', () => {
    render(
      <SquishedSwitchWithLabel checked onChange={() => {}}>
        Maalämpö
      </SquishedSwitchWithLabel>
    )

    expect(screen.getByRole('switch', { name: 'Maalämpö' })).toBeTruthy()
  })

  it('supports an explicit accessible label for non-string content', () => {
    render(
      <SquishedSwitchWithLabel
        checked
        ariaLabel="Kaukolämpö"
        onChange={() => {}}
      >
        <span>Kaukolämpö</span>
      </SquishedSwitchWithLabel>
    )

    expect(screen.getByRole('switch', { name: 'Kaukolämpö' })).toBeTruthy()
  })

  it('calls onChange when clicked', () => {
    const onChange = jest.fn()

    render(
      <SquishedSwitchWithLabel checked onChange={onChange}>
        Sähkölämmitys
      </SquishedSwitchWithLabel>
    )

    fireEvent.click(screen.getByRole('switch', { name: 'Sähkölämmitys' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.checked).toBe(false)
  })

  it('renders disabled switches as disabled controls', () => {
    render(
      <SquishedSwitchWithLabel checked disabled onChange={() => {}}>
        Aurinkolämmitys
      </SquishedSwitchWithLabel>
    )

    expect(
      screen.getByRole('switch', {
        name: 'Aurinkolämmitys',
      })
    ).toHaveAttribute('aria-disabled', 'true')
  })
})
