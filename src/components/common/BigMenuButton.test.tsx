import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import BigMenuButton from './BigMenuButton'

describe('BigMenuButton', () => {
  it('preserves label activation for nested file inputs', () => {
    const onInputClick = jest.fn()

    render(
      <BigMenuButton component="label">
        Upload file
        <input type="file" onClick={onInputClick} />
      </BigMenuButton>
    )

    fireEvent.click(screen.getByText('Upload file'))

    expect(onInputClick).toHaveBeenCalledTimes(1)
  })
})
