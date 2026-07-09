import {
  decideRequestRouting,
  REQUEST_ROUTING_SKIP_PREFIXES,
} from './requestRouting'
import { getAppletRouteSlugInfo } from './publicRoutes'

const url = (path: string, host = 'localhost') => `https://${host}${path}`

describe('public applet route slug policy', () => {
  it.each(['carbon', 'energy', 'luonnonmetsakartat'])(
    'recognizes canonical public applet slug %s',
    (slug) => {
      expect(getAppletRouteSlugInfo(slug)).toMatchObject({
        canonicalSlug: slug,
        isLegacy: false,
      })
    }
  )

  it.each(['carbonmap', 'energymap', 'energiakartta', 'hiilikartta'])(
    'does not recognize removed applet URL prefix %s',
    (slug) => {
      expect(getAppletRouteSlugInfo(slug)).toBeNull()
    }
  )

  it('does not recognize ui-baseline as a public applet slug', () => {
    expect(getAppletRouteSlugInfo('ui-baseline')).toBeNull()
  })
})

describe('request routing decisions', () => {
  describe('skipped paths', () => {
    it.each(REQUEST_ROUTING_SKIP_PREFIXES)(
      'passes through %s without locale normalization',
      (prefix) => {
        expect(
          decideRequestRouting({ url: url(`${prefix}/asset.js?x=1`) })
        ).toEqual({ type: 'passThrough' })
      }
    )
  })

  describe('main deployment mode', () => {
    const mainMode = [
      'main',
      'energiakartta',
      'carbon',
      'luonnonmetsakartat',
    ]

    it('redirects root to the default main locale', () => {
      expect(
        decideRequestRouting({ url: url('/'), compiledApplets: mainMode })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/en',
        search: '',
      })
    })

    it('preserves query strings when inserting the main locale', () => {
      expect(
        decideRequestRouting({
          url: url('/unknown/path?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/en/unknown/path',
        search: '?x=1',
      })
    })

    it('replaces invalid main locales while preserving the path and query', () => {
      expect(
        decideRequestRouting({
          url: url('/sv/search?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/en/search',
        search: '?x=1',
      })
    })

    it.each(['/adds?x=1', '/sv/adds?x=1'])(
      'keeps common localized path %s outside applet rewriting',
      (path) => {
        expect(
          decideRequestRouting({ url: url(path), compiledApplets: mainMode })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it.each([
      ['/energy/path?x=1', '/fi/energy/path'],
      ['/carbon/plans?x=1', '/fi/carbon/plans'],
      ['/luonnonmetsakartat/admin?x=1', '/fi/luonnonmetsakartat/admin'],
    ])(
      'redirects missing-locale canonical applet path %s to %s',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: mainMode,
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it.each([
      '/en/energy?x=1',
      '/fi/carbon?x=1',
      '/fi/carbon/plans?x=1',
      '/fi/carbon/plans/plan-1/areas?x=1',
      '/fi/carbon/report?x=1',
      '/fi/luonnonmetsakartat/admin?x=1',
      '/fi/ui-baseline?x=1',
      '/fi/ui-baseline/dropdowns?x=1',
    ])(
      'passes through localized canonical applet path %s with a supported locale',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: mainMode,
          })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it.each([
      ['/fi/carbon/kaavat?x=1', '/fi/carbon/plans'],
      [
        '/fi/carbon/kaavat/plan-1/alueet?x=1',
        '/fi/carbon/plans/plan-1/areas',
      ],
      ['/fi/carbon/raportti?x=1', '/fi/carbon/report'],
      ['/en/carbon/raportti?x=1', '/fi/carbon/report'],
    ])(
      'normalizes localized carbon subpath %s under canonical applet scope',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: mainMode,
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it('normalizes localized Luonnonmetsakartat admin subpaths under canonical scope', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/luonnonmetsakartat/admin/taso/layer-1/kuvat?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/luonnonmetsakartat/admin/layer/layer-1/pictures',
        search: '?x=1',
      })
    })

    it.each([
      '/fi/carbonmap/plans?x=1',
      '/fi/energymap/path?x=1',
      '/fi/energiakartta/path?x=1',
      '/fi/hiilikartta/kaavat?x=1',
    ])(
      'does not treat localized removed applet URL prefix %s as an applet path',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: mainMode,
          })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it.each([
      ['/carbonmap/plans?x=1', '/en/carbonmap/plans'],
      ['/energymap/path?x=1', '/en/energymap/path'],
      ['/energiakartta/path?x=1', '/en/energiakartta/path'],
      ['/hiilikartta/kaavat?x=1', '/en/hiilikartta/kaavat'],
    ])(
      'uses normal main locale insertion for missing-locale removed prefix %s',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: mainMode,
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it.each([
      '/fi/plans?x=1',
      '/fi/kaavat?x=1',
      '/fi/report?x=1',
      '/fi/raportti?x=1',
      '/fi/admin?x=1',
      '/fi/admin/import?x=1',
      '/fi/admin/taso/layer-1/asetukset?x=1',
      '/en/kaavat?x=1',
    ])('does not redirect localized main root-shaped applet alias %s', (path) => {
      expect(
        decideRequestRouting({
          url: url(path),
          compiledApplets: mainMode,
        })
      ).toEqual({ type: 'passThrough' })
    })

    it.each([
      ['/plans?x=1', '/en/plans'],
      ['/kaavat?x=1', '/en/kaavat'],
      ['/report?x=1', '/en/report'],
      ['/raportti?x=1', '/en/raportti'],
      ['/admin?x=1', '/en/admin'],
      ['/admin/import?x=1', '/en/admin/import'],
    ])(
      'uses normal main locale insertion for missing-locale root alias %s',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: mainMode,
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )
  })

  describe('standalone applet mode', () => {
    it.each([
      ['energiakartta', '/fi'],
      ['carbon', '/fi'],
      ['luonnonmetsakartat', '/fi'],
    ])('redirects root for %s to its default locale', (namespace, pathname) => {
      expect(
        decideRequestRouting({
          url: url('/?x=1'),
          compiledApplets: [namespace],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname,
        search: '?x=1',
      })
    })

    it.each([
      ['/kaavat?x=1', '/fi/plans'],
      ['/carbon/kaavat?x=1', '/fi/plans'],
      ['/carbonmap/plans?x=1', '/fi/carbonmap/plans'],
    ])(
      'redirects missing-locale Hiilikartta standalone path %s to %s',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: ['carbon'],
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it.each([
      ['/en/kaavat?x=1', '/fi/plans'],
      ['/en/carbon/kaavat?x=1', '/fi/plans'],
      ['/en/carbonmap/plans?x=1', '/fi/carbonmap/plans'],
    ])(
      'redirects unsupported Hiilikartta standalone locale %s to %s',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: ['carbon'],
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it.each(['/fi/plans', '/fi/plans/plan-1/areas', '/fi/report'])(
      'passes through generated Hiilikartta root-shaped path %s',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(`${path}?x=1`),
            compiledApplets: ['carbon'],
          })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it.each([
      ['/fi/kaavat?x=1', '/fi/plans'],
      ['/fi/kaavat/plan-1/alueet?x=1', '/fi/plans/plan-1/areas'],
      ['/fi/raportti?x=1', '/fi/report'],
    ])(
      'redirects standalone Hiilikartta legacy root subpath %s to %s',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: ['carbon'],
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it.each([
      '/fi/admin',
      '/fi/admin/import',
      '/fi/admin/layer/layer-1/settings',
    ])(
      'passes through generated Luonnonmetsakartat root-shaped path %s',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(`${path}?x=1`),
            compiledApplets: ['luonnonmetsakartat'],
          })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it.each([
      ['/fi/admin/tuo?x=1', '/fi/admin/import'],
      [
        '/fi/admin/taso/layer-1/asetukset?x=1',
        '/fi/admin/layer/layer-1/settings',
      ],
    ])(
      'redirects standalone Luonnonmetsakartat legacy admin subpath %s to %s',
      (path, pathname) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: ['luonnonmetsakartat'],
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it.each(['/fi', '/en'])(
      'passes through generated Energiakartta root path %s',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(`${path}?x=1`),
            compiledApplets: ['energiakartta'],
          })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it.each([
      ['/fi/carbon/plans?x=1', '/fi/plans'],
      ['/fi/carbon/kaavat?x=1', '/fi/plans'],
      ['/fi/energy/test?x=1', '/fi/test'],
      ['/fi/luonnonmetsakartat?x=1', '/fi'],
      [
        '/fi/luonnonmetsakartat/admin/taso/layer-1/asetukset?x=1',
        '/fi/admin/layer/layer-1/settings',
      ],
    ])(
      'strips duplicated canonical applet prefix %s from standalone paths',
      (path, pathname) => {
        const compiledApplets = path.includes('/energy')
          ? ['energiakartta']
          : path.includes('/luonnonmetsakartat')
            ? ['luonnonmetsakartat']
            : ['carbon']

        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets,
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname,
          search: '?x=1',
        })
      }
    )

    it.each([
      ['/fi/carbonmap/plans?x=1', ['carbon']],
      ['/fi/energymap/test?x=1', ['energiakartta']],
      ['/fi/energiakartta/test?x=1', ['energiakartta']],
      ['/fi/hiilikartta/kaavat?x=1', ['carbon']],
    ])(
      'does not strip removed old prefix %s from standalone paths',
      (path, compiledApplets) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets,
          })
        ).toEqual({ type: 'passThrough' })
      }
    )
  })

  describe('configured applet domains in main builds', () => {
    it('does not treat a configured applet domain root as an applet root', () => {
      expect(
        decideRequestRouting({
          url: url('/?x=1', 'hiilikartta.avoin.org'),
          host: 'hiilikartta.avoin.org',
          compiledApplets: ['main', 'carbon'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/en',
        search: '?x=1',
      })
    })

    it.each([
      '/fi/report?x=1',
      '/fi/kaavat?x=1',
      '/fi/admin?x=1',
      '/fi/carbonmap/kaavat?x=1',
    ])(
      'does not apply applet-domain root alias policy to %s in main mode',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(path, 'hiilikartta.avoin.org'),
            host: 'hiilikartta.avoin.org',
            compiledApplets: ['main', 'carbon'],
          })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it('still applies canonical applet path policy on configured applet domains', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/carbon/kaavat?x=1', 'hiilikartta.avoin.org'),
          host: 'hiilikartta.avoin.org',
          compiledApplets: ['main', 'carbon'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/carbon/plans',
        search: '?x=1',
      })
    })

    it('uses normal main behavior for env-backed applet domains in main mode', () => {
      expect(
        decideRequestRouting({
          url: url('/en/test?x=1', 'energy.example.test'),
          host: 'energy.example.test',
          compiledApplets: ['main', 'energiakartta'],
          env: {
            NEXT_PUBLIC_APPLET_ENERGIAKARTTA_DOMAIN:
              'https://energy.example.test',
          },
        })
      ).toEqual({ type: 'passThrough' })
    })
  })
})
