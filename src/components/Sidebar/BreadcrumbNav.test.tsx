import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import BreadcrumbNav from './BreadcrumbNav'
import { routeTree as hiilikarttaRouteTree } from '#/common/routing/routes/hiilikartta'
import { routeTree as luonnonmetsakartatRouteTree } from '#/common/routing/routes/luonnonmetsakartat'
import { mainRouteTree } from '#/common/routing/routes/main'
import type { RouteTree } from '#/common/types/routing'

let mockPathname = '/en'
let mockIsBaseDomainForApplet = false

type MutableLinkMockProps = {
  route: RouteTree
  routeTree: RouteTree
  params?: { routeParams?: Record<string, string> }
  children: React.ReactNode
}

const mockedMutableLink = jest.fn(
  ({ route, params, children }: MutableLinkMockProps) => (
    <a
      href={route._conf.path}
      data-route-name={route._conf.name}
      data-route-params={JSON.stringify(params ?? {})}
    >
      {children}
    </a>
  )
)

jest.mock('#/common/navigation/navigation', () => ({
  useAppPathname: () => mockPathname,
}))

jest.mock('#/common/store', () => ({
  useUIStore: (
    selector?: (state: { isBaseDomainForApplet: boolean }) => unknown
  ) => {
    const state = { isBaseDomainForApplet: mockIsBaseDomainForApplet }
    return selector ? selector(state) : state
  },
}))

jest.mock('#/components/common/MutableLink', () => ({
  __esModule: true,
  default: (props: MutableLinkMockProps) => mockedMutableLink(props),
}))

const routeTree: RouteTree = {
  _conf: { path: '/', name: 'Home' },
  products: {
    _conf: { path: 'products', name: 'Products' },
    product: {
      _conf: { path: '[productId]', name: 'Product' },
      details: {
        _conf: { path: 'details', name: 'Details' },
      },
    },
  },
}

describe('BreadcrumbNav', () => {
  beforeEach(() => {
    mockPathname = '/en'
    mockIsBaseDomainForApplet = false
    mockedMutableLink.mockClear()
  })

  it('matches locale-stripped paths and passes dynamic route params to links', () => {
    mockPathname = '/en/products/123/details'

    render(<BreadcrumbNav routeTree={routeTree} forceRouteTree />)

    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()

    expect(mockedMutableLink).toHaveBeenCalledWith(
      expect.objectContaining({
        route: routeTree.products.product,
        routeTree,
        params: { routeParams: { productId: '123' } },
      })
    )
  })

  it('collapses root breadcrumbs when requested', () => {
    mockPathname = '/en'

    render(
      <BreadcrumbNav
        routeTree={routeTree}
        forceRouteTree
        collapseIfRoot
      />
    )

    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('uses the main route tree for applet paths in main-app mode', () => {
    mockPathname = '/en/hiilikartta/kaavat'

    render(<BreadcrumbNav routeTree={hiilikarttaRouteTree} />)

    expect(screen.getByText('Etusivu')).toBeInTheDocument()
    expect(screen.getByText('Kaavat')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('uses the provided applet route tree in base-domain mode', () => {
    mockPathname = '/fi/kaavat'
    mockIsBaseDomainForApplet = true

    render(<BreadcrumbNav routeTree={hiilikarttaRouteTree} />)

    expect(screen.getByText('Etusivu')).toBeInTheDocument()
    expect(screen.getByText('Kaavat')).toBeInTheDocument()
  })

  it('passes Luonnonmetsakartat folayerIdSlug params through nested admin breadcrumbs', () => {
    mockPathname =
      '/fi/luonnonmetsakartat/admin/taso/layer-123/asetukset'

    render(<BreadcrumbNav routeTree={luonnonmetsakartatRouteTree} />)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Karttataso')).toBeInTheDocument()
    expect(screen.getByText('Asetukset')).toBeInTheDocument()

    expect(mockedMutableLink).toHaveBeenCalledWith(
      expect.objectContaining({
        route: luonnonmetsakartatRouteTree.admin.folayer,
        routeTree: mainRouteTree,
        params: { routeParams: { folayerIdSlug: 'layer-123' } },
      })
    )
  })
})
