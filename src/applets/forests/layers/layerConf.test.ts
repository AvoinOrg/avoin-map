import { layerConf } from './layerConf'

jest.mock('#/common/utils/map', () => ({
  buildBinnedColorExpr: () => ['literal', '#000000'],
  roundToSignificantDigitsExpr: () => ['literal', 0],
}))

const getStyle = async () =>
  typeof layerConf.style === 'function'
    ? layerConf.style()
    : Promise.resolve(layerConf.style)

describe('forests layer configuration', () => {
  const originalGeoServerUrl = process.env.PUBLIC_GEOSERVER_URL

  afterEach(() => {
    if (originalGeoServerUrl === undefined) {
      delete process.env.PUBLIC_GEOSERVER_URL
    } else {
      process.env.PUBLIC_GEOSERVER_URL = originalGeoServerUrl
    }
  })

  it('builds every forest TMS source from the normalized base', async () => {
    process.env.PUBLIC_GEOSERVER_URL =
      ' https://gis.example.test/geoserver/// '

    const style = await getStyle()
    const serializedSources = JSON.stringify(style.sources)

    expect(Object.keys(style.sources).length).toBeGreaterThan(1)
    expect(serializedSources).toContain(
      'https://gis.example.test/geoserver/gwc/service/tms/1.0.0/forest:'
    )
    expect(serializedSources).not.toContain('geoserver//gwc')
    expect(serializedSources).not.toContain('undefined')
  })

  it('returns an inert style when the shared base is unavailable', async () => {
    delete process.env.PUBLIC_GEOSERVER_URL

    const style = await getStyle()

    expect(style).toMatchObject({
      version: 8,
      name: 'fi_forests',
      sources: {},
      layers: [],
    })
    expect(JSON.stringify(style)).not.toContain('undefined')
  })
})
