import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import FrameworkImage from '#/components/common/FrameworkImage'

describe('FrameworkImage', () => {
  it('renders a string source with explicit dimensions', () => {
    render(
      <FrameworkImage
        src="/files/example.png"
        alt="Example"
        width={320}
        height={180}
      />
    )

    const image = screen.getByRole('img', { name: 'Example' })

    expect(image).toHaveAttribute('src', '/files/example.png')
    expect(image).toHaveAttribute('width', '320')
    expect(image).toHaveAttribute('height', '180')
  })

  it('uses static image dimensions by default', () => {
    render(
      <FrameworkImage
        src={{
          src: '/static/logo.png',
          width: 595,
          height: 153,
        }}
        alt="Logo"
      />
    )

    const image = screen.getByRole('img', { name: 'Logo' })

    expect(image).toHaveAttribute('src', '/static/logo.png')
    expect(image).toHaveAttribute('width', '595')
    expect(image).toHaveAttribute('height', '153')
  })

  it('fills its parent without intrinsic dimensions', () => {
    const { container } = render(
      <FrameworkImage
        src="/files/hero.jpg"
        alt=""
        width={400}
        height={300}
        fill
        style={{ objectFit: 'cover' }}
      />
    )

    const image = container.querySelector('img') as HTMLImageElement

    expect(image).toHaveAttribute('alt', '')
    expect(image).not.toHaveAttribute('width')
    expect(image).not.toHaveAttribute('height')
    expect(image).toHaveStyle({
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    })
  })
})
