import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import Cross from '#/components/icons/Cross'
import IconWithText from './IconWithText'

describe('IconWithText', () => {
  it('calls onClick for Enter and Space when interactive', () => {
    const onClick = jest.fn()

    render(
      <IconWithText icon={<Cross />} onClick={onClick}>
        Open details
      </IconWithText>
    )

    const button = screen.getByRole('button', { name: 'Open details' })
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('does not call onClick when disabled', () => {
    const onClick = jest.fn()

    render(
      <IconWithText icon={<Cross />} onClick={onClick} disabled>
        Disabled action
      </IconWithText>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(onClick).not.toHaveBeenCalled()
  })
})
