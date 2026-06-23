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
        ).toEqual({ type: 'next' })
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
        ).toEqual({ type: 'next' })
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
        pathname: '/fi/energiakartta',
        search: '?x=1',
      })
    })

    it('passes through a localized applet path with a supported locale', () => {
      expect(
        decideRequestRouting({
          url: url('/en/energiakartta?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({ type: 'next' })
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
        pathname: '/fi/hiilikartta',
        search: '?x=1',
      })
    })

    it('keeps the energymap alias visible when adding the missing locale', () => {
      expect(
        decideRequestRouting({
          url: url('/energymap/path?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/energymap/path',
        search: '?x=1',
      })
    })

    it('rewrites the localized energymap alias to the canonical applet route', () => {
      expect(
        decideRequestRouting({
          url: url('/en/energymap/path?x=1'),
          compiledApplets: mainMode,
        })
      ).toEqual({
        type: 'rewrite',
        pathname: '/en/energiakartta/path',
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
        pathname: '/fi/kaavat',
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
        pathname: '/fi/kaavat',
        search: '?x=1',
      })
    })

    it('rewrites supported standalone paths to the internal applet route', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/admin?x=1'),
          compiledApplets: ['luonnonmetsakartat'],
        })
      ).toEqual({
        type: 'rewrite',
        pathname: '/fi/luonnonmetsakartat/admin',
        search: '?x=1',
      })
    })

    it('strips duplicated applet namespaces from standalone paths', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/hiilikartta/kaavat?x=1'),
          compiledApplets: ['hiilikartta'],
        })
      ).toEqual({
        type: 'redirect',
        status: 308,
        pathname: '/fi/kaavat',
        search: '?x=1',
      })
    })

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

    it('rewrites standalone energymap aliases to the canonical applet route', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/energymap/test?x=1'),
          compiledApplets: ['energiakartta'],
        })
      ).toEqual({
        type: 'rewrite',
        pathname: '/fi/energiakartta/test',
        search: '?x=1',
      })
    })
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
      'rewrites applet-aware child paths on configured domains without ' +
        'duplicating namespace',
      () => {
        expect(
          decideRequestRouting({
            url: url('/fi/kaavat?x=1', 'hiilikartta.avoin.org'),
            host: 'hiilikartta.avoin.org',
            compiledApplets: ['main', 'hiilikartta'],
          })
        ).toEqual({
          type: 'rewrite',
          pathname: '/fi/hiilikartta/kaavat',
          search: '?x=1',
        })
      }
    )

    it('passes through already canonical paths on configured domains', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/hiilikartta/kaavat?x=1', 'hiilikartta.avoin.org'),
          host: 'hiilikartta.avoin.org',
          compiledApplets: ['main', 'hiilikartta'],
        })
      ).toEqual({ type: 'next' })
    })

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
        pathname: '/en/energiakartta/test',
        search: '?x=1',
      })
    })

    it('keeps non-matching domains in main-mode semantics', () => {
      expect(
        decideRequestRouting({
          url: url('/fi/kaavat?x=1', 'example.org'),
          host: 'example.org',
          compiledApplets: ['main', 'hiilikartta'],
        })
      ).toEqual({ type: 'next' })
    })
  })
})
