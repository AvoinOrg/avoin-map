import { createFolayerConf, getFolayerSourceId } from './utils'

jest.mock('../components/AreaModal', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('../components/AreaModalAdmin', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('#/common/store', () => ({
  useMapStore: {
    getState: jest.fn(() => ({
      easeTo: jest.fn(),
    })),
  },
}))

describe('createFolayerConf', () => {
  const originalGeoServerUrl = process.env.PUBLIC_GEOSERVER_URL
  const originalWorkspace =
    process.env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE
  const originalMockScenarios =
    process.env.PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED

  beforeEach(() => {
    process.env.PUBLIC_GEOSERVER_URL =
      'https://gis.example.test/geoserver///'
    process.env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE = 'forests'
    process.env.PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED = '0'
  })

  afterAll(() => {
    const restoreEnv = (key: string, value: string | undefined) => {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }

    restoreEnv('PUBLIC_GEOSERVER_URL', originalGeoServerUrl)
    restoreEnv(
      'PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE',
      originalWorkspace
    )
    restoreEnv(
      'PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED',
      originalMockScenarios
    )
  })

  it('preserves the symbol label config and adds collision padding', async () => {
    const folayerId = 'forest-layer-id'
    const sourceId = getFolayerSourceId(folayerId, false)
    const layerConf = await createFolayerConf({
      folayerId,
      folayerName: 'Forest layer',
      colorCode: '#4cbf00',
    })
    const style =
      typeof layerConf.style === 'function'
        ? await layerConf.style()
        : layerConf.style
    const symbolLayer = style.layers.find(
      (layer) => layer.id === `${sourceId}-symbol`
    )

    expect(symbolLayer).toMatchObject({
      id: `${sourceId}-symbol`,
      source: sourceId,
      type: 'symbol',
      minzoom: 11,
      layout: expect.objectContaining({
        'symbol-placement': 'point',
        'text-field': ['get', 'name'],
        'text-allow-overlap': false,
        'text-padding': 40,
      }),
    })
  })

  it('uses the normalized configuration for the vector tile source', async () => {
    const layerConf = await createFolayerConf({
      folayerId: 'forest-layer-id',
      folayerName: 'Forest layer',
      colorCode: '#4cbf00',
    })
    const style =
      typeof layerConf.style === 'function'
        ? await layerConf.style()
        : layerConf.style
    const sourceId = getFolayerSourceId('forest-layer-id', false)

    expect(style.sources[sourceId]).toMatchObject({
      tiles: [
        'https://gis.example.test/geoserver/gwc/service/tms/1.0.0/forests:forest_areas_forestlayerid@EPSG:900913@pbf/{z}/{x}/{y}.pbf',
      ],
    })
  })

  it('returns an inert style when real GeoServer configuration is unavailable', async () => {
    delete process.env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE

    const layerConf = await createFolayerConf({
      folayerId: 'forest-layer-id',
      folayerName: 'Forest layer',
      colorCode: '#4cbf00',
    })
    const style =
      typeof layerConf.style === 'function'
        ? await layerConf.style()
        : layerConf.style

    expect(style).toEqual({ version: 8, sources: {}, layers: [] })
    expect(JSON.stringify(layerConf)).not.toContain('undefined')
  })
})
