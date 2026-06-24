const {
  generateNetlifyRedirects,
  parseCompiledApplets,
} = require('./writeNetlifyRedirects')

const appletConf = {
  main: {
    localeNs: 'avoin-map',
    langs: ['en', 'fi'],
  },
  hiilikartta: {
    localeNs: 'hiilikartta',
    langs: ['fi'],
    domains: ['hiilikartta.avoin.org'],
  },
  luonnonmetsakartat: {
    localeNs: 'luonnonmetsakartat',
    langs: ['fi'],
    domains: ['luonnonmetsakartat.avoin.org'],
  },
  energiakartta: {
    localeNs: 'energiakartta',
    langs: ['fi', 'en'],
  },
}

const parseGeneratedRules = (redirects) =>
  redirects
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/)
      return { from, to, status }
    })

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const matchSourcePattern = (pattern, value) => {
  const source = escapeRegExp(pattern).replace(/\\\*/g, '(?<splat>.*)')
  return value.match(new RegExp(`^${source}$`))
}

const firstMatchingRule = (redirects, value) => {
  for (const rule of parseGeneratedRules(redirects)) {
    const match = matchSourcePattern(rule.from, value)
    if (!match) continue

    const splat = match.groups?.splat || ''
    return {
      ...rule,
      resolvedTo: rule.to.replace(':splat', splat),
    }
  }

  return null
}

describe('writeNetlifyRedirects', () => {
  const mainBaseUrl = 'https://main.example.netlify.app'
  const standaloneBaseUrl = 'https://hiilikartta-context.example.netlify.app'
  const hiilikarttaDomain = 'https://hiilikartta.avoin.org'

  it('parses compiled applets like the applet build config', () => {
    expect(parseCompiledApplets('main, Hiilikartta,main')).toEqual([
      'main',
      'hiilikartta',
    ])
  })

  it('generates ordered main-mode domain proxy rules for Start output paths', () => {
    const redirects = generateNetlifyRedirects({
      appletConf,
      baseUrl: mainBaseUrl,
      compiledApplets: parseCompiledApplets('main,hiilikartta'),
      env: {},
    })

    expect(redirects).toContain(
      `${hiilikarttaDomain}/assets/* ${mainBaseUrl}/assets/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/_build/* ${mainBaseUrl}/_build/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/_serverFn/* ${mainBaseUrl}/_serverFn/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/files/* ${mainBaseUrl}/files/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/lib/* ${mainBaseUrl}/lib/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/api/* ${mainBaseUrl}/api/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/adds/* ${mainBaseUrl}/fi/adds/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/api/* ` +
        `${mainBaseUrl}/fi/hiilikartta/api/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi ${mainBaseUrl}/fi/hiilikartta 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/hiilikartta ` +
        `${mainBaseUrl}/fi/hiilikartta 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/hiilikartta/* ` +
        `${mainBaseUrl}/fi/hiilikartta/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/ /fi 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/en/* /fi/:splat 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/* /fi/:splat 301!`
    )
    expect(redirects).not.toContain(
      `${hiilikarttaDomain}/* ${mainBaseUrl}/fi/hiilikartta/:splat 200!`
    )
    expect(redirects).not.toContain('_next')
    expect(redirects).not.toContain('.next')

    expect(redirects.indexOf('/assets/*')).toBeLessThan(
      redirects.indexOf('https://hiilikartta.avoin.org/*')
    )
    expect(redirects.indexOf('/fi/api/*')).toBeLessThan(
      redirects.indexOf('https://hiilikartta.avoin.org/fi/*')
    )
    expect(redirects.indexOf('/fi/hiilikartta/*')).toBeLessThan(
      redirects.indexOf('https://hiilikartta.avoin.org/fi/*')
    )
    expect(redirects.indexOf('/fi/*')).toBeLessThan(
      redirects.indexOf('https://hiilikartta.avoin.org/en/*')
    )
    expect(redirects.indexOf('/en/*')).toBeLessThan(
      redirects.indexOf('https://hiilikartta.avoin.org/*')
    )
  })

  it('normalizes applet-domain roots and locales before main-mode rewrites', () => {
    const redirects = generateNetlifyRedirects({
      appletConf,
      baseUrl: mainBaseUrl,
      compiledApplets: parseCompiledApplets('main,hiilikartta'),
      env: {},
    })

    expect(redirects).toContain(
      `${hiilikarttaDomain}/ /fi 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/en /fi 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/en/* /fi/:splat 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/* /fi/:splat 301!`
    )
    expect(redirects).not.toContain(
      `${hiilikarttaDomain}/en/* ${mainBaseUrl}/fi/hiilikartta/en/:splat 200!`
    )

    expect(
      firstMatchingRule(redirects, `${hiilikarttaDomain}/`)
    ).toMatchObject({
      from: `${hiilikarttaDomain}/`,
      resolvedTo: '/fi',
      status: '301!',
    })
    expect(
      firstMatchingRule(redirects, `${hiilikarttaDomain}/kaavat`)
    ).toMatchObject({
      from: `${hiilikarttaDomain}/*`,
      resolvedTo: '/fi/kaavat',
      status: '301!',
    })
    expect(
      firstMatchingRule(redirects, `${hiilikarttaDomain}/en/kaavat`)
    ).toMatchObject({
      from: `${hiilikarttaDomain}/en/*`,
      resolvedTo: '/fi/kaavat',
      status: '301!',
    })
    expect(
      firstMatchingRule(redirects, `${hiilikarttaDomain}/fi/kaavat`)
    ).toMatchObject({
      from: `${hiilikarttaDomain}/fi/*`,
      resolvedTo: `${mainBaseUrl}/fi/hiilikartta/kaavat`,
      status: '200!',
    })
    expect(
      firstMatchingRule(
        redirects,
        `${hiilikarttaDomain}/fi/hiilikartta/kaavat`
      )
    ).toMatchObject({
      from: `${hiilikarttaDomain}/fi/hiilikartta/*`,
      resolvedTo: `${mainBaseUrl}/fi/hiilikartta/kaavat`,
      status: '200!',
    })
  })

  it('keeps localized applet aliases from being duplicated by domain catch-alls', () => {
    const energyDomain = 'https://energy.example.test'
    const redirects = generateNetlifyRedirects({
      appletConf,
      baseUrl: mainBaseUrl,
      compiledApplets: parseCompiledApplets('main,energiakartta'),
      env: {
        NEXT_PUBLIC_APPLET_ENERGIAKARTTA_DOMAIN: energyDomain,
      },
    })

    expect(redirects).toContain(
      `${energyDomain}/en/energiakartta/* ` +
        `${mainBaseUrl}/en/energiakartta/:splat 200!`
    )
    expect(redirects).toContain(
      `${energyDomain}/en/energymap ` +
        `${mainBaseUrl}/en/energiakartta 200!`
    )
    expect(redirects).toContain(
      `${energyDomain}/en/energymap/* ` +
        `${mainBaseUrl}/en/energiakartta/:splat 200!`
    )
    expect(redirects).not.toContain('/en/energiakartta/energymap/:splat')
    expect(redirects.indexOf('/en/energymap/*')).toBeLessThan(
      redirects.indexOf(`${energyDomain}/en/*`)
    )
  })

  it('generates standalone applet-domain rules without canonical namespace URLs', () => {
    const redirects = generateNetlifyRedirects({
      appletConf,
      baseUrl: standaloneBaseUrl,
      compiledApplets: parseCompiledApplets('hiilikartta'),
      env: {},
    })

    expect(redirects).toContain(
      `${hiilikarttaDomain}/ /fi 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/api/* ` +
        `${standaloneBaseUrl}/fi/api/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/hiilikartta /fi 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/hiilikartta/* /fi/:splat 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/fi/* ${standaloneBaseUrl}/fi/:splat 200!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/en/* /fi/:splat 301!`
    )
    expect(redirects).toContain(
      `${hiilikarttaDomain}/* /fi/:splat 301!`
    )
    expect(redirects).not.toContain('/fi/hiilikartta/:splat')
    expect(redirects.indexOf('/fi/hiilikartta/*')).toBeLessThan(
      redirects.indexOf('https://hiilikartta.avoin.org/fi/*')
    )
    expect(redirects.indexOf('/fi/*')).toBeLessThan(
      redirects.indexOf('https://hiilikartta.avoin.org/en/*')
    )
    expect(
      firstMatchingRule(redirects, `${hiilikarttaDomain}/kaavat`)
    ).toMatchObject({
      from: `${hiilikarttaDomain}/*`,
      resolvedTo: '/fi/kaavat',
      status: '301!',
    })
    expect(
      firstMatchingRule(redirects, `${hiilikarttaDomain}/en/kaavat`)
    ).toMatchObject({
      from: `${hiilikarttaDomain}/en/*`,
      resolvedTo: '/fi/kaavat',
      status: '301!',
    })
    expect(
      firstMatchingRule(redirects, `${hiilikarttaDomain}/fi/admin`)
    ).toMatchObject({
      from: `${hiilikarttaDomain}/fi/*`,
      resolvedTo: `${standaloneBaseUrl}/fi/admin`,
      status: '200!',
    })
    expect(
      firstMatchingRule(
        redirects,
        `${hiilikarttaDomain}/fi/hiilikartta/kaavat`
      )
    ).toMatchObject({
      from: `${hiilikarttaDomain}/fi/hiilikartta/*`,
      resolvedTo: '/fi/kaavat',
      status: '301!',
    })
    expect(redirects).not.toContain('luonnonmetsakartat.avoin.org')
  })
})
