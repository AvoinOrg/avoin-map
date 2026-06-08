import '#/test/baseUiTestPolyfills'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import ColorPickerWithPopover from './ColorPickerWithPopover'

jest.mock('react-colorful', () => ({
  HexColorPicker: ({
    color,
    onChange,
  }: {
    color: string
    onChange: (color: string) => void
  }) => (
    <button type="button" onClick={() => onChange('#ffffff')}>
      picker:{color}
    </button>
  ),
}))

describe('ColorPickerWithPopover', () => {
  it('opens the picker and commits changed color when closed', () => {
    const onChange = jest.fn()

    render(
      <ColorPickerWithPopover
        color="#000000"
        onChange={onChange}
        labelText="Layer color"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Layer color' }))
    fireEvent.click(screen.getByRole('button', { name: 'picker:#000000' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onChange).toHaveBeenCalledWith('#ffffff')
  })

  it('syncs external color while closed', () => {
    const { rerender } = render(
      <ColorPickerWithPopover
        color="#000000"
        onChange={() => {}}
        ariaLabel="Open color picker"
      />
    )

    rerender(
      <ColorPickerWithPopover
        color="#123456"
        onChange={() => {}}
        ariaLabel="Open color picker"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open color picker' }))

    expect(screen.getByRole('button', { name: 'picker:#123456' }))
      .toBeInTheDocument()
  })
})
