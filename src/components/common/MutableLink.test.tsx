import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { RouteTree } from '#/common/types/routing'

type MockNextIntlLinkProps = React.ComponentPropsWithoutRef<'a'> & {
  href: string
  prefetch?: boolean
  sx?: unknown
}

const mockedNextIntlLink = jest.fn((props: MockNextIntlLinkProps) => props)
let isBaseDomainForApplet = false

function MockNextIntlLink(
  {
    children,
    href,
    sx,
    prefetch,
    ...anchorProps
  }: MockNextIntlLinkProps,
  ref: React.Ref<HTMLAnchorElement>
) {
  mockedNextIntlLink({
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

MockNextIntlLink.displayName = 'MockNextIntlLink'

jest.mock('#/common/hooks/routing/useGetRoute', () => {
  const mock = jest.fn(
    (
      _route: { _conf: { path: string } },
      _routeTree: RouteTree,
      params: {
        routeParams?: Record<string, string>
        queryParams?: Record<string, string>
      } = {},
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _removeSteps?: number,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _removeStepsFromRoot?: number
    ) => {
      const itemId = params.routeParams?.itemId ?? ''
      const query = new URLSearchParams(params.queryParams ?? {}).toString()
      const querySuffix = query ? `?${query}` : ''

      return _routeTree._conf.path === 'applet-root'
        ? `/section/${itemId}${querySuffix}`
        : `/section/${itemId}${querySuffix}`
    }
  )

  return {
    useGetRoute: mock,
  }
})

const useUIStoreMock = Object.assign(
  (
    selector?: (state: { isBaseDomainForApplet: boolean }) => unknown,
  ) => {
    const state = { isBaseDomainForApplet }
    return selector ? selector(state) : state
  },
  {
    getState: () => ({ isBaseDomainForApplet }),
    setState: (state: { isBaseDomainForApplet?: boolean }) => {
      if (state.isBaseDomainForApplet != null) {
        isBaseDomainForApplet = state.isBaseDomainForApplet
      }
    },
  }
)

type UseUIStoreMock = typeof useUIStoreMock

jest.mock('#/common/store/uiStore', () => ({
  useUIStore: useUIStoreMock,
}))

jest.mock('#/common/store', () => ({
  useUIStore: useUIStoreMock,
}))

jest.mock('#/common/navigation/navigation', () => ({
  NextIntlLink: React.forwardRef<HTMLAnchorElement, MockNextIntlLinkProps>(MockNextIntlLink),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MutableLink = require('#/components/common/MutableLink').default as typeof import(
  '#/components/common/MutableLink'
).default

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useGetRoute } = require('#/common/hooks/routing/useGetRoute') as {
  useGetRoute: jest.Mock
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useUIStore } = require('#/common/store/uiStore') as {
  useUIStore: UseUIStoreMock
}

const routeTree: RouteTree = {
  _conf: {
    path: 'applet-root',
    name: 'Applet root',
    isAppletRoot: true,
  },
  section: {
    _conf: {
      path: 'section',
      name: 'Section',
    },
    item: {
      _conf: {
        path: '[itemId]',
        name: 'Item',
      },
    },
  },
}

  describe('MutableLink', () => {
  afterEach(() => {
    mockedNextIntlLink.mockClear()
    useUIStore.setState({ isBaseDomainForApplet: false })
  })

  it('uses getRoute when not on applet base domain', () => {
    ;useUIStore.setState({ isBaseDomainForApplet: false })

    render(
      <MutableLink
        route={routeTree.section.item}
        routeTree={routeTree}
        params={{ routeParams: { itemId: 'abc-123' }, queryParams: { tab: 'overview' } }}
      >
        Open item
      </MutableLink>
    )

    const link = screen.getByRole('link', { name: 'Open item' })

    expect(link).toHaveAttribute('href', '/applet-root/section/abc-123?tab=overview')
  })

  it('uses useGetRoute and strips applet root on base-domain mode', () => {
    ;useUIStore.setState({ isBaseDomainForApplet: true })

    render(
      <MutableLink
        route={routeTree.section.item}
        routeTree={routeTree}
        params={{ routeParams: { itemId: 'abc-123' }, queryParams: { tab: 'overview' } }}
      >
        Open item
      </MutableLink>
    )

    const link = screen.getByRole('link', { name: 'Open item' })

    expect(link).toHaveAttribute('href', '/section/abc-123?tab=overview')
  })

  it('passes route/query params and mutable link options', () => {
    ;useUIStore.setState({ isBaseDomainForApplet: true })

    const onClick = jest.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
    })

    render(
      <MutableLink
        route={routeTree.section.item}
        routeTree={routeTree}
        params={{ routeParams: { itemId: 'abc-123' }, queryParams: { tab: 'overview' } }}
        prefetch={false}
        removeStepsFromRoot={2}
        onClick={onClick}
      >
        Open item
      </MutableLink>
    )

    const link = screen.getByRole('link', { name: 'Open item' })

    expect(useGetRoute).toHaveBeenCalledWith(
      routeTree.section.item,
      routeTree,
      { routeParams: { itemId: 'abc-123' }, queryParams: { tab: 'overview' } },
      0,
      2
    )

    expect(link).toHaveAttribute('href', '/section/abc-123?tab=overview')
    expect(link).toHaveAttribute('data-prefetch', 'false')
    expect(mockedNextIntlLink.mock.calls[0][0].prefetch).toBe(false)

    fireEvent.click(link)

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
