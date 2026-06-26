import {
  decideRequestRouting,
  REQUEST_ROUTING_SKIP_PREFIXES,
} from './requestRouting'

const url = (path: string, host = 'localhost') => `https://${host}${path}`

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
      'hiilikartta',
      'luonnonmetsakartat',
    ]

    it('redirects root to the default locale', () => {
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

    it('replaces a bare invalid main locale with the main default locale', () => {
      expect(
        decideRequestRouting({
          url: url('/sv?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/en',
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

    it('redirects an applet path without locale to that applet default locale', () => {
      expect(
        decideRequestRouting({
          url: url('/energiakartta?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/energy',
        search: '?x=1',
      })
    })

    it.each([
      '/en/energy?x=1',
      '/fi/carbon?x=1',
      '/fi/carbon/plans?x=1',
      '/fi/carbon/plans/plan-1/areas?x=1',
      '/fi/carbon/report?x=1',
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

    it('redirects localized legacy Energiakartta paths to energy', () => {
      expect(
        decideRequestRouting({
          url: url('/en/energiakartta/path?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/en/energy/path',
        search: '?x=1',
      })
    })

    it('passes through canonical API paths without locale normalization', () => {
      expect(
        decideRequestRouting({
          url: url('/api/hiilikartta/calculation?id=calc-1'),
          compiledApplets: mainMode,
        })
      ).toEqual({ type: 'passThrough' })
    })

    it('redirects a localized applet path with an unsupported locale', () => {
      expect(
        decideRequestRouting({
          url: url('/en/hiilikartta?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/carbon',
        search: '?x=1',
      })
    })

    it('redirects missing-locale legacy Hiilikartta subpaths to canonical English paths', () => {
      expect(
        decideRequestRouting({
          url: url('/hiilikartta/kaavat/plan-1/alueet?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/carbon/plans/plan-1/areas',
        search: '?x=1',
      })
    })

    it('redirects missing-locale canonical applet paths to the applet default locale', () => {
      expect(
        decideRequestRouting({
          url: url('/energy/path?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/energy/path',
        search: '?x=1',
      })
    })

    it('redirects missing-locale legacy energymap paths to energy', () => {
      expect(
        decideRequestRouting({
          url: url('/energymap/path?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/energy/path',
        search: '?x=1',
      })
    })

    it('redirects localized legacy energymap paths to energy', () => {
      expect(
        decideRequestRouting({
          url: url('/en/energymap/path?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/en/energy/path',
        search: '?x=1',
      })
    })

    it('redirects localized legacy carbonmap paths to carbon', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/carbonmap/plans?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/carbon/plans',
        search: '?x=1',
      })
    })

    it('redirects missing-locale legacy carbonmap paths to carbon', () => {
      expect(
        decideRequestRouting({
          url: url('/carbonmap/plans?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/carbon/plans',
        search: '?x=1',
      })
    })

    it('redirects localized legacy Luonnonmetsakartat admin subpaths to English paths', () => {
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
      ['/fi/kaavat?x=1', '/fi/carbon/plans'],
      ['/fi/kaavat/plan-1/alueet?x=1', '/fi/carbon/plans/plan-1/areas'],
      ['/fi/raportti?x=1', '/fi/carbon/report'],
      ['/fi/admin/tuo?x=1', '/fi/luonnonmetsakartat/admin/import'],
      [
        '/fi/admin/taso/layer-1/asetukset?x=1',
        '/fi/luonnonmetsakartat/admin/layer/layer-1/settings',
      ],
    ])(
      'redirects localized main-host legacy root alias %s to %s',
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

    it('redirects localized main-host legacy root aliases with unsupported applet locales to the applet default locale', () => {
      expect(
        decideRequestRouting({
          url: url('/en/kaavat?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/carbon/plans',
        search: '?x=1',
      })
    })
  })

  describe('standalone applet mode', () => {
    it.each([
      ['energiakartta', '/fi'],
      ['hiilikartta', '/fi'],
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

    it('redirects missing-locale standalone paths to the applet default locale', () => {
      expect(
        decideRequestRouting({
          url: url('/kaavat?x=1'),
          compiledApplets: ['hiilikartta'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/plans',
        search: '?x=1',
      })
    })

    it('redirects unsupported standalone locales to the applet default locale', () => {
      expect(
        decideRequestRouting({
          url: url('/en/kaavat?x=1'),
          compiledApplets: ['hiilikartta'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/plans',
        search: '?x=1',
      })
    })

    it.each(['/fi/plans', '/fi/plans/plan-1/areas', '/fi/report'])(
      'passes through generated Hiilikartta root-shaped path %s',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(`${path}?x=1`),
            compiledApplets: ['hiilikartta'],
          })
        ).toEqual({ type: 'passThrough' })
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

    it('strips duplicated applet namespaces from standalone paths', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/hiilikartta/kaavat?x=1'),
          compiledApplets: ['hiilikartta'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/plans',
        search: '?x=1',
      })
    })

    it.each(['/fi/carbon/plans?x=1', '/fi/carbonmap/plans?x=1'])(
      'strips duplicated Hiilikartta public applet slug %s from standalone paths',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: ['hiilikartta'],
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname: '/fi/plans',
          search: '?x=1',
        })
      }
    )

    it('strips a duplicated applet namespace from a standalone applet root', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/luonnonmetsakartat?x=1'),
          compiledApplets: ['luonnonmetsakartat'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi',
        search: '?x=1',
      })
    })

    it('strips duplicated Luonnonmetsakartat legacy admin subpaths from standalone paths', () => {
      expect(
        decideRequestRouting({
          url: url(
            '/fi/luonnonmetsakartat/admin/taso/layer-1/asetukset?x=1'
          ),
          compiledApplets: ['luonnonmetsakartat'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/admin/layer/layer-1/settings',
        search: '?x=1',
      })
    })

    it.each(['/fi/energy/test?x=1', '/fi/energymap/test?x=1'])(
      'strips standalone Energiakartta public slug %s to root-shaped paths',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(path),
            compiledApplets: ['energiakartta'],
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname: '/fi/test',
          search: '?x=1',
        })
      }
    )
  })

  describe('domain-based applet roots', () => {
    it('treats a configured applet domain root as that applet root', () => {
      expect(
        decideRequestRouting({
          url: url('/?x=1', 'hiilikartta.avoin.org'),
          host: 'hiilikartta.avoin.org',
          compiledApplets: ['main', 'hiilikartta'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi',
        search: '?x=1',
      })
    })

    it(
      'passes through English applet-aware child paths on configured domains without ' +
        'duplicating namespace',
      () => {
        expect(
          decideRequestRouting({
            url: url('/fi/plans?x=1', 'hiilikartta.avoin.org'),
            host: 'hiilikartta.avoin.org',
            compiledApplets: ['main', 'hiilikartta'],
          })
        ).toEqual({ type: 'passThrough' })
      }
    )

    it('passes through already canonical paths on configured domains', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/carbon/plans?x=1', 'hiilikartta.avoin.org'),
          host: 'hiilikartta.avoin.org',
          compiledApplets: ['main', 'hiilikartta'],
        })
      ).toEqual({ type: 'passThrough' })
    })

    it.each(['/fi/hiilikartta/kaavat?x=1', '/fi/carbonmap/kaavat?x=1'])(
      'redirects legacy full-app path %s on configured domains to public English paths',
      (path) => {
        expect(
          decideRequestRouting({
            url: url(path, 'hiilikartta.avoin.org'),
            host: 'hiilikartta.avoin.org',
            compiledApplets: ['main', 'hiilikartta'],
          })
        ).toEqual({
          type: 'redirect',
          status: 308,
          pathname: '/fi/carbon/plans',
          search: '?x=1',
        })
      }
    )

    it('uses env-backed applet domains in addition to appletConf domains', () => {
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
      ).toEqual({
        type: 'rewrite',
        pathname: '/en/energy/test',
        search: '?x=1',
      })
    })

    it('uses main-mode root-alias canonicalization on non-matching domains', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/kaavat?x=1', 'example.org'),
          host: 'example.org',
          compiledApplets: ['main', 'hiilikartta'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/carbon/plans',
        search: '?x=1',
      })
    })
  })
})
