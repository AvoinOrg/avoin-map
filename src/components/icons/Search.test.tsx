import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server.node'
import { render, screen } from '@testing-library/react'

import Search from './Search'

describe('Search icon', () => {
  it('renders Panda sx overrides as DOM styles', () => {
    render(
      <Search
        data-testid="search-icon"
        sx={{ width: '1rem', height: 22, color: 'text.secondary' }}
      />
    )

    const icon = screen.getByTestId('search-icon')

    expect(icon.style.width).toBe('1rem')
    expect(icon.style.height).toBe('22px')
  })

  it('keeps token color overrides in rendered markup', () => {
    const markup = renderToStaticMarkup(
      <Search sx={{ color: 'text.secondary' }} />
    )

    expect(markup).toContain('color:var(--colors-text-secondary)')
  })
})
