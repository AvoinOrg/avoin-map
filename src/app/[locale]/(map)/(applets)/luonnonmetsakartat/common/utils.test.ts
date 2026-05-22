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
})
