import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'

import LoadingHorizontal from './LoadingHorizontal'

describe('LoadingHorizontal', () => {
  it('renders a progressbar and maps Panda sx to inline style', () => {
    render(
      <LoadingHorizontal
        aria-label="Loading row"
        sx={{ width: 16, height: 16, color: 'text.secondary' }}
      />
    )

    expect(screen.getByRole('progressbar', { name: 'Loading row' }))
      .toHaveStyle({
        width: '16px',
        height: '16px',
        color: 'var(--colors-text-secondary)',
      })
  })
})
