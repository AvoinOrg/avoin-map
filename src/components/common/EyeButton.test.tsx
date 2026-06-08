import '@testing-library/jest-dom'
import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import type { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import { EyeButton } from './EyeButton'

const EyeButtonHarness = () => {
  const [status, setStatus] = useState<LayerGroupStatus>('hidden')

  return (
    <EyeButton
      ariaLabel="Toggle test layer"
      color="#0D6044"
      status={status}
      onClick={() => {
        setStatus((currentStatus) =>
          currentStatus === 'hidden' ? 'visible' : 'hidden'
        )
      }}
    />
  )
}

describe('EyeButton', () => {
  it('renders the visibility state supplied by callers after activation', () => {
    render(<EyeButtonHarness />)

    const button = screen.getByRole('button', { name: 'Toggle test layer' })

    expect(button.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 26 15')

    fireEvent.click(button)

    expect(button.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 23 13')
  })
})
