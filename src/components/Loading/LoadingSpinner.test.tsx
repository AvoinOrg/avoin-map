import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'

import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders an indeterminate progressbar with numeric pixel sizing', () => {
    render(<LoadingSpinner size={32} color="secondary" />)

    const spinner = screen.getByRole('progressbar')

    expect(spinner).toHaveStyle({
      width: '32px',
      height: '32px',
      color: 'var(--colors-secondary-main)',
    })
    expect(spinner).not.toHaveAttribute('aria-valuenow')
  })

  it('renders determinate progress metadata and supports sx overrides', () => {
    render(
      <LoadingSpinner
        variant="determinate"
        value={42}
        size="3rem"
        sx={{ color: 'warning.main', mt: 1 }}
      />
    )

    const spinner = screen.getByRole('progressbar')

    expect(spinner).toHaveAttribute('aria-valuenow', '42')
    expect(spinner).toHaveStyle({
      width: '3rem',
      height: '3rem',
      color: 'var(--colors-warning-main)',
      marginTop: '0.5rem',
    })
  })
})
