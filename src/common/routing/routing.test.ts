import { RouteTree } from '../types/routing'
import { generatePathNames, getRouteParent, getRoutesForPath } from './routing'
import { getRoute } from './routing-client'
import { cloneDeep } from 'lodash-es'
import { routeTree as hiilikarttaRouteTree } from './routes/hiilikartta'
import { routeTree as luonnonmetsakartatRouteTree } from './routes/luonnonmetsakartat'

describe('routing utils', () => {
  const routeTree: RouteTree = {
    _conf: { path: '/', name: 'Home' },
    products: {
      _conf: { path: 'products', name: 'Products' },
      product: {
        _conf: { path: '[productId]', name: 'Product' },
        details: {
          _conf: { path: 'details', name: 'Details' },
        },
        order: {
          _conf: { path: 'order/[orderId]', name: 'Order' },
        },
      },
    },
    stuff: {
      _conf: { path: 'stuff/[stuffId]', name: 'Stuff' },
      settings: {
        _conf: { path: 'settings', name: 'Settings' },
      },
      extras: {
        _conf: { path: 'extras', name: 'Extras' },
        extra: {
          _conf: { path: '[extraId]', name: 'Extra' },
        },
      },
    },
    about: {
      _conf: { path: 'about', name: 'About' },
      contact: {
        _conf: { path: 'contact', name: 'Contact' },
      },
    },
  }

  const routeTreeWithDomains: RouteTree = cloneDeep(routeTree)
  routeTreeWithDomains._conf = {
    ...routeTreeWithDomains._conf,
    domain: 'https://example.org',
  }
  routeTreeWithDomains.about._conf = {
    ...routeTreeWithDomains.about._conf,
    domain: 'https://about.example.org',
  }

  const routeTreeWithDomainsNoBaseDomain: RouteTree = cloneDeep(routeTree)
  routeTreeWithDomainsNoBaseDomain.about._conf = {
    ...routeTreeWithDomainsNoBaseDomain.about._conf,
    domain: 'https://about.example.org',
  }

  const routeTreeWithBase: RouteTree = cloneDeep(routeTree)
  routeTreeWithBase._conf.path = '/home'

  const routeTreeWithTrailingSlashDomain: RouteTree = cloneDeep(routeTree)
  routeTreeWithTrailingSlashDomain._conf = {
    ...routeTreeWithTrailingSlashDomain._conf,
    domain: 'https://example.org/',
  }

  const routeTreeWithDomainReset: RouteTree = {
    _conf: { path: '/', name: 'Root' },
    muna: {
      _conf: { path: 'muna', name: 'Muna' },
      kalle: {
        _conf: { path: 'kalle', name: 'Kalle', domain: 'https://domain.org' },
        juntti: {
          _conf: { path: 'juntti', name: 'Juntti' },
        },
      },
    },
  }

  const routeTreeWithStartSegments: RouteTree = {
    _conf: { path: '/', name: 'Home' },
    products: {
      _conf: { path: 'products', name: 'Products' },
      product: {
        _conf: { path: '[productId]', name: 'Product' },
        order: {
          _conf: { path: 'orders/$orderId', name: 'Order' },
        },
      },
    },
  }

  const appletRouteTree: RouteTree = {
    _conf: { path: 'applet-root', name: 'Applet', isAppletRoot: true },
    section: {
      _conf: { path: 'section', name: 'Section' },
      item: {
        _conf: { path: '[itemId]', name: 'Item' },
      },
    },
  }

  describe('getRoute', () => {
    it('returns the correct route with no parameters', () => {
      const route = getRoute({ routeNode: routeTree.about, routeTree })
      expect(route).toBe('/about')
    })

    it('returns the correct route with no parameters for a route tree with a base path', () => {
      const route = getRoute({
        routeNode: routeTreeWithBase.about,
        routeTree: routeTreeWithBase,
      })
      expect(route).toBe('/home/about')
    })

    it('returns the correct route with route parameters', () => {
      const route = getRoute({
        routeNode: routeTree.products.product,
        routeTree,
        params: {
          routeParams: {
            productId: '123',
          },
        },
      })
      expect(route).toBe('/products/123')
    })

    it('returns the correct route with route parameters', () => {
      const route = getRoute({
        routeNode: routeTree.products.product.order,
        routeTree,
        params: {
          routeParams: {
            productId: '123',
            orderId: '456',
          },
        },
      })
      expect(route).toBe('/products/123/order/456')
    })

    it('returns the correct route with Start-style route parameters', () => {
      const route = getRoute({
        routeNode: routeTreeWithStartSegments.products.product.order,
        routeTree: routeTreeWithStartSegments,
        params: {
          routeParams: {
            productId: '123',
            orderId: '456',
          },
        },
      })
      expect(route).toBe('/products/123/orders/456')
    })

    it('returns the correct route with route parameters', () => {
      const route = getRoute({
        routeNode: routeTree.stuff.extras.extra,
        routeTree: routeTree,
        params: {
          routeParams: {
            stuffId: '123',
            extraId: '456',
          },
        },
      })
      expect(route).toBe('/stuff/123/extras/456')
    })

    it('returns the correct route with route parameters for a route tree with a base path', () => {
      const route = getRoute({
        routeNode: routeTreeWithBase.stuff.settings,
        routeTree: routeTreeWithBase,
        params: {
          routeParams: {
            stuffId: '123',
          },
        },
      })
      expect(route).toBe('/home/stuff/123/settings')
    })

    it('returns the correct route with query parameters', () => {
      const route = getRoute({
        routeNode: routeTree.products,
        routeTree: routeTree,
        params: {
          queryParams: {
            productId: '123',
          },
        },
      })
      expect(route).toBe('/products?productId=123')
    })

    it('returns the correct route with query and route parameters', () => {
      const route = getRoute({
        routeNode: routeTree.products.product.order,
        routeTree: routeTree,
        params: {
          routeParams: {
            productId: '123',
            orderId: '456',
          },
          queryParams: {
            extraValue: 'true',
            sessionId: 'abc123',
          },
        },
      })
      expect(route).toBe(
        '/products/123/order/456?extraValue=true&sessionId=abc123'
      )
    })

    it('returns the correct route with route parameters and URLSearchParameters as query parameters', () => {
      const route = getRoute({
        routeNode: routeTree.products.product.order,
        routeTree: routeTree,
        params: {
          routeParams: {
            productId: '123',
            orderId: '456',
          },
          queryParams: new URLSearchParams({
            extraValue: 'true',
            sessionId: 'abc123',
          }),
        },
      })
      expect(route).toBe(
        '/products/123/order/456?extraValue=true&sessionId=abc123'
      )
    })

    it('returns the correct route with structural search params', () => {
      const queryParams = {
        toString: () => 'extraValue=true&sessionId=abc123',
        entries: function* () {
          yield ['extraValue', 'true'] as [string, string]
          yield ['sessionId', 'abc123'] as [string, string]
        },
      }

      const route = getRoute({
        routeNode: routeTree.products,
        routeTree,
        params: { queryParams },
      })

      expect(route).toBe('/products?extraValue=true&sessionId=abc123')
    })

    it('returns Hiilikartta plan routes using the planId param key', () => {
      expect(
        getRoute({
          routeNode: hiilikarttaRouteTree.plans,
          routeTree: hiilikarttaRouteTree,
        })
      ).toBe('/hiilikartta/kaavat')

      expect(
        getRoute({
          routeNode: hiilikarttaRouteTree.plans.plan,
          routeTree: hiilikarttaRouteTree,
          params: {
            routeParams: {
              planId: 'plan-123',
            },
          },
        })
      ).toBe('/hiilikartta/kaavat/plan-123')

      expect(
        getRoute({
          routeNode: hiilikarttaRouteTree.plans.plan.areas,
          routeTree: hiilikarttaRouteTree,
          params: {
            routeParams: {
              planId: 'plan-123',
            },
          },
        })
      ).toBe('/hiilikartta/kaavat/plan-123/alueet')
    })

    it('returns the Hiilikartta report route with URLSearchParams', () => {
      const queryParams = new URLSearchParams({
        planIds: 'server-1,server-2',
        prevPageId: 'plan-123',
        prevPageStep: 'areas',
      })

      const route = getRoute({
        routeNode: hiilikarttaRouteTree.report,
        routeTree: hiilikarttaRouteTree,
        params: {
          queryParams,
        },
      })

      expect(route).toBe(
        '/hiilikartta/raportti?planIds=server-1%2Cserver-2&prevPageId=plan-123&prevPageStep=areas'
      )
    })

    it('returns Luonnonmetsakartat folayer routes using the folayerIdSlug param key', () => {
      expect(
        getRoute({
          routeNode: luonnonmetsakartatRouteTree.admin.folayer,
          routeTree: luonnonmetsakartatRouteTree,
          params: {
            routeParams: {
              folayerIdSlug: 'layer-123',
            },
          },
        })
      ).toBe('/luonnonmetsakartat/admin/taso/layer-123')

      expect(
        getRoute({
          routeNode: luonnonmetsakartatRouteTree.admin.folayer.settings,
          routeTree: luonnonmetsakartatRouteTree,
          params: {
            routeParams: {
              folayerIdSlug: 'layer-123',
            },
          },
        })
      ).toBe('/luonnonmetsakartat/admin/taso/layer-123/asetukset')

      expect(
        getRoute({
          routeNode: luonnonmetsakartatRouteTree.admin.folayer.pictures,
          routeTree: luonnonmetsakartatRouteTree,
          params: {
            routeParams: {
              folayerIdSlug: 'layer-123',
            },
          },
        })
      ).toBe('/luonnonmetsakartat/admin/taso/layer-123/kuvat')
    })

    it('throws for Luonnonmetsakartat folayer routes when only the old folayerId param key is provided', () => {
      expect(() =>
        getRoute({
          routeNode: luonnonmetsakartatRouteTree.admin.folayer,
          routeTree: luonnonmetsakartatRouteTree,
          params: {
            routeParams: {
              folayerId: 'layer-123',
            },
          },
        })
      ).toThrowError('Not enough params provided')
    })

    it('returns the correct route with query and route parameters for a route tree with a base path', () => {
      const route = getRoute({
        routeNode: routeTreeWithBase.stuff.settings,
        routeTree: routeTreeWithBase,
        params: {
          routeParams: {
            stuffId: '123',
          },
          queryParams: {
            extraValue: 'true',
          },
        },
      })
      expect(route).toBe('/home/stuff/123/settings?extraValue=true')
    })

    it('handles routes when the root has a domain', () => {
      const route = getRoute({
        routeNode: routeTreeWithDomains.products,
        routeTree: routeTreeWithDomains,
      })
      expect(route).toBe('https://example.org/products')
    })

    it('trims trailing slashes from route domains', () => {
      const route = getRoute({
        routeNode: routeTreeWithTrailingSlashDomain.products,
        routeTree: routeTreeWithTrailingSlashDomain,
      })
      expect(route).toBe('https://example.org/products')
    })

    it('handles nested domained routes', () => {
      const route = getRoute({
        routeNode: routeTreeWithDomains.about.contact,
        routeTree: routeTreeWithDomains,
      })
      expect(route).toBe('https://about.example.org/about/contact')
    })

    it('handles domain resets within the tree', () => {
      const route = getRoute({
        routeNode: routeTreeWithDomainReset.muna.kalle.juntti,
        routeTree: routeTreeWithDomainReset,
      })
      expect(route).toBe('https://domain.org/kalle/juntti')
    })

    it('throws an error if route not found', () => {
      expect(() =>
        getRoute({
          routeNode: { _conf: { name: 'None', path: '/none' } },
          routeTree: routeTree,
        })
      ).toThrowError('Route not found')
    })

    it('throws an error if not enough route parameters are provided', () => {
      expect(() =>
        getRoute({
          routeNode: routeTree.products.product,
          routeTree: routeTree,
        })
      ).toThrowError('Not enough params provided')
    })

    it('throws an error if incorrect parameters are provided', () => {
      expect(() =>
        getRoute({
          routeNode: routeTree.products.product,
          routeTree: routeTree,
          params: {
            routeParams: { incorrectId: '123' },
          },
        })
      ).toThrowError('Not enough params provided')
    })
  })

  describe('getRouteParent', () => {
    it('returns the correct parent route with no route parameters', () => {
      const route = getRouteParent(routeTree.products.product, routeTree)
      expect(route).toBe('/products')
    })

    it('returns the correct parent route with route parameters', () => {
      const route = getRouteParent(routeTree.products.product, routeTree, {
        routeParams: {
          productId: '123',
        },
      })
      expect(route).toBe('/products')
    })

    it('returns the root route as the parent of a top-level route', () => {
      const route = getRouteParent(routeTree.about, routeTree)
      expect(route).toBe('/')
    })

    it('returns the root route as the parent of a top-level route for a route tree with a base path', () => {
      const route = getRouteParent(routeTreeWithBase.about, routeTreeWithBase)
      expect(route).toBe('/home')
    })

    it('returns the domained parent route when the node has a domain', () => {
      const route = getRouteParent(
        routeTreeWithDomains.about.contact,
        routeTreeWithDomains
      )
      expect(route).toBe('https://about.example.org/about')
    })

    it('returns the domained parent route when an ancestor resets the domain', () => {
      const route = getRouteParent(
        routeTreeWithDomainReset.muna.kalle.juntti,
        routeTreeWithDomainReset
      )
      expect(route).toBe('https://domain.org/kalle')
    })
  })

  describe('getRoutesForPath', () => {
    it('returns a correct set of routes for a path', () => {
      // useUIStore.setState({ isBaseDomainForApplet: false })
      const routes = getRoutesForPath('/en/products/123/', routeTree)
      expect(routes).toEqual([
        { name: 'Home', path: '/', routeTree: routeTree },
        { name: 'Products', path: '/products', routeTree: routeTree.products },
        {
          name: 'Product',
          params: { routeParams: { productId: '123' } },
          path: '/products/123',
          routeTree: routeTree.products.product,
        },
      ])
    })

    it('returns a correct set of routes for a path with query parameters', () => {
      const routes = getRoutesForPath(
        '/products/123/?extraValue=true&sessionId=abc123',
        routeTree
      )
      expect(routes).toEqual([
        { name: 'Home', path: '/', routeTree: routeTree },
        { name: 'Products', path: '/products', routeTree: routeTree.products },
        {
          name: 'Product',
          params: { routeParams: { productId: '123' } },
          path: '/products/123',
          routeTree: routeTree.products.product,
        },
      ])
    })

    it('returns a correct set of routes for a path', () => {
      const routes = getRoutesForPath('/products/123/order/456', routeTree)
      expect(routes).toEqual([
        { name: 'Home', path: '/', routeTree: routeTree },
        { name: 'Products', path: '/products', routeTree: routeTree.products },
        {
          name: 'Product',
          params: { routeParams: { productId: '123' } },
          path: '/products/123',
          routeTree: routeTree.products.product,
        },
        {
          name: 'Order',
          params: { routeParams: { productId: '123', orderId: '456' } },
          path: '/products/123/order/456',
          routeTree: routeTree.products.product.order,
        },
      ])
    })

    it('returns a correct set of routes for mixed route-object and Start-style params', () => {
      const routes = getRoutesForPath(
        '/products/123/orders/456',
        routeTreeWithStartSegments
      )
      expect(routes).toEqual([
        { name: 'Home', path: '/', routeTree: routeTreeWithStartSegments },
        {
          name: 'Products',
          path: '/products',
          routeTree: routeTreeWithStartSegments.products,
        },
        {
          name: 'Product',
          params: { routeParams: { productId: '123' } },
          path: '/products/123',
          routeTree: routeTreeWithStartSegments.products.product,
        },
        {
          name: 'Order',
          params: { routeParams: { productId: '123', orderId: '456' } },
          path: '/products/123/orders/456',
          routeTree: routeTreeWithStartSegments.products.product.order,
        },
      ])
    })

    it('matches applet-root routes when the applet root segment is omitted', () => {
      const routes = getRoutesForPath('/section/abc-123', appletRouteTree)
      expect(routes).toEqual([
        {
          name: 'Applet',
          path: '/applet-root',
          routeTree: appletRouteTree,
        },
        {
          name: 'Section',
          path: '/applet-root/section',
          routeTree: appletRouteTree.section,
        },
        {
          name: 'Item',
          params: { routeParams: { itemId: 'abc-123' } },
          path: '/applet-root/section/abc-123',
          routeTree: appletRouteTree.section.item,
        },
      ])
    })

    it('returns a correct set of routes for a path with query parameters', () => {
      const routes = getRoutesForPath(
        '/stuff/123/settings?extraValue=true',
        routeTree
      )
      expect(routes).toEqual([
        { name: 'Home', path: '/', routeTree: routeTree },
        {
          name: 'Stuff',
          params: { routeParams: { stuffId: '123' } },
          path: '/stuff/123',
          routeTree: routeTree.stuff,
        },
        {
          name: 'Settings',
          params: { routeParams: { stuffId: '123' } },
          path: '/stuff/123/settings',
          routeTree: routeTree.stuff.settings,
        },
      ])
    })

    it('returns a correct set of routes for a path', () => {
      const routes = getRoutesForPath('/stuff/123/extras/456', routeTree)
      expect(routes).toEqual([
        { name: 'Home', path: '/', routeTree: routeTree },
        {
          name: 'Stuff',
          params: { routeParams: { stuffId: '123' } },
          path: '/stuff/123',
          routeTree: routeTree.stuff,
        },
        {
          name: 'Extras',
          params: { routeParams: { stuffId: '123' } },
          path: '/stuff/123/extras',
          routeTree: routeTree.stuff.extras,
        },
        {
          name: 'Extra',
          params: { routeParams: { stuffId: '123', extraId: '456' } },
          path: '/stuff/123/extras/456',
          routeTree: routeTree.stuff.extras.extra,
        },
      ])
    })

    it('returns a correct set of routes for a path', () => {
      const routes = getRoutesForPath('/', routeTree)
      expect(routes).toEqual([
        { name: 'Home', path: '/', routeTree: routeTree },
      ])
    })

    it('returns a correct set of routes for a path for a route tree with a base path', () => {
      const routes = getRoutesForPath(
        '/home/stuff/123/settings',
        routeTreeWithBase
      )
      expect(routes).toEqual([
        { name: 'Home', path: '/home', routeTree: routeTreeWithBase },
        {
          name: 'Stuff',
          params: { routeParams: { stuffId: '123' } },
          path: '/home/stuff/123',
          routeTree: routeTreeWithBase.stuff,
        },
        {
          name: 'Settings',
          params: { routeParams: { stuffId: '123' } },
          path: '/home/stuff/123/settings',
          routeTree: routeTreeWithBase.stuff.settings,
        },
      ])
    })

    it('returns a correct set of routes for a path for a route tree with a base path', () => {
      const routes = getRoutesForPath('/home/about/contact', routeTreeWithBase)
      expect(routes).toEqual([
        { name: 'Home', path: '/home', routeTree: routeTreeWithBase },
        {
          name: 'About',
          path: '/home/about',
          routeTree: routeTreeWithBase.about,
        },
        {
          name: 'Contact',
          path: '/home/about/contact',
          routeTree: routeTreeWithBase.about.contact,
        },
      ])
    })

    it('returns a correct set of routes for a path for a route tree with a base path', () => {
      const routes = getRoutesForPath('/home', routeTreeWithBase)
      expect(routes).toEqual([
        { name: 'Home', path: '/home', routeTree: routeTreeWithBase },
      ])
    })

    it('returns domained routes when the root has a domain', () => {
      const routes = getRoutesForPath(
        'https://example.org/products/123',
        routeTreeWithDomains
      )
      expect(routes).toEqual([
        {
          name: 'Home',
          path: 'https://example.org',
          routeTree: routeTreeWithDomains,
        },
        {
          name: 'Products',
          path: 'https://example.org/products',
          routeTree: routeTreeWithDomains.products,
        },
        {
          name: 'Product',
          path: 'https://example.org/products/123',
          params: { routeParams: { productId: '123' } },
          routeTree: routeTreeWithDomains.products.product,
        },
      ])
    })

    it('matches domained routes when the configured domain has a trailing slash', () => {
      const routes = getRoutesForPath(
        'https://example.org/products/123',
        routeTreeWithTrailingSlashDomain
      )
      expect(routes).toEqual([
        {
          name: 'Home',
          path: 'https://example.org',
          routeTree: routeTreeWithTrailingSlashDomain,
        },
        {
          name: 'Products',
          path: 'https://example.org/products',
          routeTree: routeTreeWithTrailingSlashDomain.products,
        },
        {
          name: 'Product',
          path: 'https://example.org/products/123',
          params: { routeParams: { productId: '123' } },
          routeTree: routeTreeWithTrailingSlashDomain.products.product,
        },
      ])
    })

    it('returns domained routes for nested domains', () => {
      const routes = getRoutesForPath(
        'https://about.example.org/about/contact',
        routeTreeWithDomains
      )
      expect(routes).toEqual([
        {
          name: 'About',
          path: 'https://about.example.org/about',
          routeTree: routeTreeWithDomains.about,
        },
        {
          name: 'Contact',
          path: 'https://about.example.org/about/contact',
          routeTree: routeTreeWithDomains.about.contact,
        },
      ])
    })

    it('returns domained routes when a descendant resets the domain', () => {
      const routes = getRoutesForPath(
        'https://domain.org/kalle/juntti',
        routeTreeWithDomainReset
      )
      expect(routes).toEqual([
        { name: 'Root', path: '/', routeTree: routeTreeWithDomainReset },
        {
          name: 'Kalle',
          path: 'https://domain.org/kalle',
          routeTree: routeTreeWithDomainReset.muna.kalle,
        },
        {
          name: 'Juntti',
          path: 'https://domain.org/kalle/juntti',
          routeTree: routeTreeWithDomainReset.muna.kalle.juntti,
        },
      ])
    })

    it('returns Hiilikartta routes for localized plan areas paths', () => {
      const routes = getRoutesForPath(
        '/fi/hiilikartta/kaavat/plan-123/alueet',
        hiilikarttaRouteTree
      )

      expect(routes).toEqual([
        {
          name: 'Etusivu',
          path: '/hiilikartta',
          routeTree: hiilikarttaRouteTree,
        },
        {
          name: 'Kaavat',
          path: '/hiilikartta/kaavat',
          routeTree: hiilikarttaRouteTree.plans,
        },
        {
          name: 'Kaava',
          params: { routeParams: { planId: 'plan-123' } },
          path: '/hiilikartta/kaavat/plan-123',
          routeTree: hiilikarttaRouteTree.plans.plan,
        },
        {
          name: 'Alueet',
          params: { routeParams: { planId: 'plan-123' } },
          path: '/hiilikartta/kaavat/plan-123/alueet',
          routeTree: hiilikarttaRouteTree.plans.plan.areas,
        },
      ])
    })

    it('returns Luonnonmetsakartat routes with folayerIdSlug params for localized pictures paths', () => {
      const routes = getRoutesForPath(
        '/fi/luonnonmetsakartat/admin/taso/layer-123/kuvat',
        luonnonmetsakartatRouteTree
      )

      expect(routes).toEqual([
        {
          name: 'Etusivu',
          path: '/luonnonmetsakartat',
          routeTree: luonnonmetsakartatRouteTree,
        },
        {
          name: 'Admin',
          path: '/luonnonmetsakartat/admin',
          routeTree: luonnonmetsakartatRouteTree.admin,
        },
        {
          name: 'Karttataso',
          params: { routeParams: { folayerIdSlug: 'layer-123' } },
          path: '/luonnonmetsakartat/admin/taso/layer-123',
          routeTree: luonnonmetsakartatRouteTree.admin.folayer,
        },
        {
          name: 'Kuvat',
          params: { routeParams: { folayerIdSlug: 'layer-123' } },
          path: '/luonnonmetsakartat/admin/taso/layer-123/kuvat',
          routeTree: luonnonmetsakartatRouteTree.admin.folayer.pictures,
        },
      ])
    })
  })
  describe('generatePathNames', () => {
    it('returns a correct array of path names for a routeTree', () => {
      // useUIStore.setState({ isBaseDomainForApplet: false })
      const pathnames = generatePathNames([routeTree])
      expect(pathnames).toEqual({
        '/': '/',
        '/about': '/about',
        '/about/contact': '/about/contact',
        '/products': '/products',
        '/products/[productId]': '/products/[productId]',
        '/products/[productId]/details': '/products/[productId]/details',
        '/products/[productId]/order/[orderId]':
          '/products/[productId]/order/[orderId]',
        '/stuff/[stuffId]': '/stuff/[stuffId]',
        '/stuff/[stuffId]/extras': '/stuff/[stuffId]/extras',
        '/stuff/[stuffId]/extras/[extraId]':
          '/stuff/[stuffId]/extras/[extraId]',
        '/stuff/[stuffId]/settings': '/stuff/[stuffId]/settings',
      })
    })
  })
})
