import layerConf from './layerConf'

jest.mock('#/common/utils/map', () => ({
  roundToSignificantDigitsExpr: () => ['literal', 0],
}))

jest.mock('./Popup', () => ({
  __esModule: true,
  default: () => null,
}))

const getStyle = async () =>
  typeof layerConf.style === 'function'
    ? layerConf.style()
    : Promise.resolve(layerConf.style)

describe('Helsinki buildings layer configuration', () => {
  const originalGeoServerUrl = process.env.PUBLIC_GEOSERVER_URL

  afterEach(() => {
    if (originalGeoServerUrl === undefined) {
      delete process.env.PUBLIC_GEOSERVER_URL
    } else {
      process.env.PUBLIC_GEOSERVER_URL = originalGeoServerUrl
    }
  })

  it('uses the normalized shared GeoServer base', async () => {
    process.env.PUBLIC_GEOSERVER_URL =
      ' https://gis.example.test/geoserver/// '

    const style = await getStyle()

    expect(style.sources.helsinki_buildings).toMatchObject({
      tiles: [
        'https://gis.example.test/geoserver/gwc/service/tms/1.0.0/misc:helsinki_buildings@EPSG:900913@pbf/{z}/{x}/{y}.pbf',
      ],
    })
  })

  it('returns an inert style when the shared base is missing', async () => {
    delete process.env.PUBLIC_GEOSERVER_URL

    const style = await getStyle()

    expect(style).toMatchObject({
      version: 8,
      name: 'helsinki_buildings',
      sources: {},
      layers: [],
    })
    expect(JSON.stringify(style)).not.toContain('undefined')
  })
})
