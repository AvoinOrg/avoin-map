import {
  appendPublicGeoServerPath,
  buildPublicGeoServerUrl,
  createPublicGeoServerProblemReporter,
  isPublicGeoServerRequest,
  normalizePublicGeoServerBase,
  normalizePublicGeoServerWorkspace,
  resolvePublicGeoServerBase,
  resolvePublicGeoServerWithWorkspace,
} from './publicGeoServer'

describe('public GeoServer configuration', () => {
  it.each([
    [' https://gis.example.test/geoserver/ ', 'https://gis.example.test/geoserver'],
    ['https://gis.example.test/geoserver///', 'https://gis.example.test/geoserver'],
    ['http://gis.example.test:8080/root/geoserver/', 'http://gis.example.test:8080/root/geoserver'],
    ['https://gis.example.test/', 'https://gis.example.test'],
  ])('normalizes an appendable base URL', (value, expected) => {
    expect(normalizePublicGeoServerBase(value)).toEqual({
      ok: true,
      value: expected,
    })
  })

  it.each([
    [undefined, 'base-missing'],
    ['', 'base-missing'],
    ['   ', 'base-missing'],
    ['/geoserver', 'base-invalid-url'],
    ['not a url', 'base-invalid-url'],
    ['ftp://gis.example.test/geoserver', 'base-invalid-url'],
    ['https://user:password@gis.example.test/geoserver', 'base-credentials'],
    ['https://gis.example.test/geoserver?tenant=one', 'base-query-or-fragment'],
    ['https://gis.example.test/geoserver#section', 'base-query-or-fragment'],
    ['https://undefined.example.test/geoserver', 'base-undefined-host-or-path'],
    ['https://gis.example.test/geoserver/undefined/root', 'base-undefined-host-or-path'],
  ])('rejects an unsafe base URL', (value, problemId) => {
    expect(normalizePublicGeoServerBase(value)).toMatchObject({
      ok: false,
      problem: { id: problemId },
    })
  })

  it('normalizes a safe workspace token', () => {
    expect(normalizePublicGeoServerWorkspace(' forests_workspace-1.2 ')).toEqual(
      {
        ok: true,
        value: 'forests_workspace-1.2',
      }
    )
  })

  it.each([
    [undefined, 'workspace-missing'],
    ['', 'workspace-missing'],
    ['   ', 'workspace-missing'],
    ['forests/workspace', 'workspace-invalid-token'],
    ['forests?workspace', 'workspace-invalid-token'],
    ['forests#workspace', 'workspace-invalid-token'],
    ['forests:workspace', 'workspace-invalid-token'],
    ['undefined', 'workspace-undefined-token'],
    ['forests_undefined', 'workspace-undefined-token'],
  ])('rejects an unsafe workspace', (value, problemId) => {
    expect(normalizePublicGeoServerWorkspace(value)).toMatchObject({
      ok: false,
      problem: { id: problemId },
    })
  })

  it('builds URLs only from validated inputs with one separator', () => {
    expect(
      buildPublicGeoServerUrl({
        env: {
          PUBLIC_GEOSERVER_URL: ' https://gis.example.test/geoserver/// ',
        },
        path: '/gwc/service/tms/1.0.0/workspace:layer/{z}/{x}/{y}.pbf',
      })
    ).toBe(
      'https://gis.example.test/geoserver/gwc/service/tms/1.0.0/workspace:layer/{z}/{x}/{y}.pbf'
    )

    expect(
      appendPublicGeoServerPath({
        baseUrl: 'https://gis.example.test/geoserver',
        path: 'gwc/undefined/layer.pbf',
      })
    ).toBeUndefined()
  })

  it('never serializes missing base or workspace values', () => {
    const baseUrl = buildPublicGeoServerUrl({
      env: {},
      path: 'gwc/service/tms/layer.pbf',
    })
    const config = resolvePublicGeoServerWithWorkspace({
      env: { PUBLIC_GEOSERVER_URL: 'https://gis.example.test/geoserver' },
    })

    expect(baseUrl).toBeUndefined()
    expect(config).toBeUndefined()
    expect(JSON.stringify({ baseUrl, config })).not.toContain('undefined/')
  })

  it('reports each distinct problem at most once without exposing values', () => {
    const messages: string[] = []
    const reportProblem = createPublicGeoServerProblemReporter((message) =>
      messages.push(message)
    )
    const invalidValue = 'https://private-value.example.test/undefined'

    resolvePublicGeoServerBase({
      env: { PUBLIC_GEOSERVER_URL: invalidValue },
      reportProblem,
    })
    resolvePublicGeoServerBase({
      env: { PUBLIC_GEOSERVER_URL: invalidValue },
      reportProblem,
    })
    resolvePublicGeoServerWithWorkspace({
      env: { PUBLIC_GEOSERVER_URL: invalidValue },
      reportProblem,
    })
    resolvePublicGeoServerWithWorkspace({
      env: { PUBLIC_GEOSERVER_URL: invalidValue },
      reportProblem,
    })

    expect(messages).toHaveLength(2)
    expect(messages.join(' ')).toContain('PUBLIC_GEOSERVER_URL')
    expect(messages.join(' ')).toContain(
      'PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE'
    )
    expect(messages.join(' ')).not.toContain(invalidValue)
  })

  it('matches requests by normalized origin and GeoServer path boundary', () => {
    const baseUrl = 'https://gis.example.test/geoserver///'

    expect(
      isPublicGeoServerRequest({
        baseUrl,
        url: 'https://gis.example.test/geoserver/wms?requireToken=true',
      })
    ).toBe(true)
    expect(
      isPublicGeoServerRequest({
        baseUrl,
        url: 'https://gis.example.test/geoserver-other/wms?requireToken=true',
      })
    ).toBe(false)
    expect(
      isPublicGeoServerRequest({
        baseUrl,
        url: 'https://other.example.test/?target=https://gis.example.test/geoserver',
      })
    ).toBe(false)
  })
})
