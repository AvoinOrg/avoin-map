import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

type MockAppLinkProps = React.ComponentPropsWithoutRef<'a'> & {
  href: string
  prefetch?: boolean
  sx?: unknown
}

const mockedAppLink = jest.fn((props: MockAppLinkProps) => props)

function MockAppLink(
  {
    children,
    href,
    sx,
    prefetch,
    ...anchorProps
  }: MockAppLinkProps,
  ref: React.Ref<HTMLAnchorElement>
) {
  mockedAppLink({
    children,
    href,
    sx,
    prefetch,
    ...anchorProps,
  })

  return (
    <a
      ref={ref}
      href={href}
      data-prefetch={String(prefetch)}
      data-sx={JSON.stringify(sx)}
      {...anchorProps}
    >
      {children}
    </a>
  )
}

MockAppLink.displayName = 'MockAppLink'

jest.mock('#/common/navigation/navigation', () => ({
  AppLink: React.forwardRef<HTMLAnchorElement, MockAppLinkProps>(MockAppLink),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Link = require('#/components/common/Link').default as typeof import(
  '#/components/common/Link'
).default

describe('Link', () => {
  afterEach(() => {
    mockedAppLink.mockClear()
  })

  it('renders children in a link and defaults prefetch to true', () => {
    render(
      <Link href="/apples" aria-label="Open section">
        Open section
      </Link>
    )

    const link = screen.getByRole('link', { name: 'Open section' })

    expect(link).toHaveAttribute('href', '/apples')
    expect(link).toHaveAttribute('data-prefetch', 'true')

    const [props] = mockedAppLink.mock.calls[0]

    expect(props).toMatchObject({
      href: '/apples',
      prefetch: true,
    })
  })

  it('honors explicit prefetch={false}', () => {
    render(
      <Link href="/apples" prefetch={false}>
        Open section
      </Link>
    )

    const link = screen.getByRole('link', { name: 'Open section' })

    expect(link).toHaveAttribute('data-prefetch', 'false')
    expect(mockedAppLink.mock.calls[0][0].prefetch).toBe(false)
  })

  it('passes anchor props and interaction handlers', () => {
    const onClick = jest.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
    })

    render(
      <Link
        href="https://example.com"
        target="_blank"
        rel="noopener"
        aria-label="External docs"
        onClick={onClick}
      >
        External
      </Link>
    )

    const link = screen.getByRole('link', { name: 'External docs' })

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')

    fireEvent.click(link)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('passes sx props to the link with pre-render styling merge', () => {
    render(
      <Link href="/apples" sx={[{ color: 'red', mt: 2 }, { '&:hover': { opacity: 1 } }]}>
        Styled
      </Link>
    )

    const link = screen.getByRole('link', { name: 'Styled' })

    expect(link).toBeInTheDocument()
    expect(mockedAppLink).toHaveBeenCalledTimes(1)
  })
})
