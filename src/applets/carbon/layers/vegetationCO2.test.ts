import { vegetationCO2LayerConf } from './vegetationCO2'

const getStyle = async () =>
  typeof vegetationCO2LayerConf.style === 'function'
    ? vegetationCO2LayerConf.style()
    : Promise.resolve(vegetationCO2LayerConf.style)

describe('vegetation carbon layer configuration', () => {
  const originalGeoServerUrl = process.env.PUBLIC_GEOSERVER_URL

  afterEach(() => {
    if (originalGeoServerUrl === undefined) {
      delete process.env.PUBLIC_GEOSERVER_URL
    } else {
      process.env.PUBLIC_GEOSERVER_URL = originalGeoServerUrl
    }
  })

  it('preserves the WMTS request on a normalized base', async () => {
    process.env.PUBLIC_GEOSERVER_URL =
      ' https://gis.example.test/geoserver/// '

    const style = await getStyle()
    const source = style.sources.kasvillisuudenhiili_2021_tcha

    expect(source).toMatchObject({
      tiles: [
        'https://gis.example.test/geoserver/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=hiilikartta:kasvillisuudenhiili_2021_tcha&STYLE=&TILEMATRIXSET=EPSG:900913&TILEMATRIX=EPSG:900913:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
      ],
    })
  })

  it('returns an inert style when the shared base is malformed', async () => {
    process.env.PUBLIC_GEOSERVER_URL = 'https://gis.example.test/undefined'

    const style = await getStyle()

    expect(style).toMatchObject({
      version: 8,
      name: 'kasvillisuudenhiili_2021_tcha',
      sources: {},
      layers: [],
    })
    expect(JSON.stringify(style)).not.toContain('undefined')
  })
})
