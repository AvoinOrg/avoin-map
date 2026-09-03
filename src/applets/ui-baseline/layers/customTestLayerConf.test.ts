import type {
  LayerSpecification,
  Map as MapLibreMap,
  SourceSpecification,
  StyleSpecification,
} from 'maplibre-gl'
import { LayerOrderLevel } from '#/common/types/map'
import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import { useMapStore } from '#/common/store/mapStore/mapStore'
import { getLayerName } from '#/common/utils/map'

import customTestLayerConf, {
  UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID,
  UI_BASELINE_CUSTOM_TEST_SOURCE_ID,
} from './customTestLayerConf'

jest.mock('maplibre_symbol_utils', () => ({ canvasFill: jest.fn() }))
jest.mock('#/common/utils/store', () => ({
  ...jest.requireActual('#/common/utils/store'),
  createIndexedDbStorage: () => () => ({
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  }),
}))
jest.mock('maplibre-gl', () => {
  class MapLibreMapMock {}
  class LngLatBoundsMock {}

  return {
    __esModule: true,
    default: {
      Map: MapLibreMapMock,
      LngLatBounds: LngLatBoundsMock,
    },
    Map: MapLibreMapMock,
    LngLatBounds: LngLatBoundsMock,
  }
})

const getStaticStyle = (): StyleSpecification => {
  if (typeof customTestLayerConf.style === 'function') {
    throw new Error('Expected a static fixture style')
  }

  return customTestLayerConf.style
}

describe('ui-baseline custom test layer', () => {
  it('uses only a local store-backed GeoJSON source and ui-baseline ids', () => {
    expect(customTestLayerConf.id).toBe(UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID)
    expect(typeof customTestLayerConf.style).toBe('object')

    const style = getStaticStyle()

    const source = style.sources[UI_BASELINE_CUSTOM_TEST_SOURCE_ID]

    expect(source.type).toBe('store')
    expect(source).not.toHaveProperty('url')
    expect(source).not.toHaveProperty('tiles')
    expect(style.layers).toHaveLength(4)
    expect(JSON.stringify(customTestLayerConf).toLowerCase()).not.toMatch(
      /energy|building|heating|certificate/
    )
  })

  it('uses one type suffix separator in each concrete layer id', () => {
    const layers = getStaticStyle().layers

    expect(layers.map(({ id, type }) => ({ id, type }))).toEqual([
      { id: 'uiBaselineCustomTestZones-fill', type: 'fill' },
      { id: 'uiBaselineCustomTestRoutes-line', type: 'line' },
      { id: 'uiBaselineCustomTestPoints-circle', type: 'circle' },
      { id: 'uiBaselineCustomTestLabels-symbol', type: 'symbol' },
    ])

    for (const layer of layers) {
      const [base, suffix, ...extraParts] = layer.id.split('-')

      expect(base).not.toBe('')
      expect(suffix).toBe(layer.type)
      expect(extraParts).toHaveLength(0)
    }
  })

  it('derives every concrete layer name without reporting an error', () => {
    const errorSpy = jest.spyOn(console, 'error')

    try {
      expect(
        getStaticStyle().layers.map((layer) => getLayerName(layer.id))
      ).toEqual([
        'uiBaselineCustomTestZones',
        'uiBaselineCustomTestRoutes',
        'uiBaselineCustomTestPoints',
        'uiBaselineCustomTestLabels',
      ])
      expect(errorSpy).not.toHaveBeenCalled()
    } finally {
      errorSpy.mockRestore()
    }
  })

  it('registers the store source and all four layers without an error', async () => {
    const registeredSources = new Map<string, SourceSpecification>()
    const registeredLayers: LayerSpecification[] = []
    const fakeMap = {
      addSource: (id: string, source: SourceSpecification) => {
        registeredSources.set(id, source)
      },
      getStyle: () => ({
        version: 8 as const,
        sources: Object.fromEntries(registeredSources),
        layers: registeredLayers,
      }),
      getLayer: (id: string) =>
        registeredLayers.find((layer) => layer.id === id),
      addLayer: (layer: LayerSpecification, beforeId?: string) => {
        const beforeIndex = beforeId
          ? registeredLayers.findIndex(({ id }) => id === beforeId)
          : -1

        if (beforeIndex === -1) {
          registeredLayers.push(layer)
        } else {
          registeredLayers.splice(beforeIndex, 0, layer)
        }
      },
      setLayoutProperty: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as MapLibreMap
    const previousMap = useMapInstanceStore.getState()._map
    const previousState = useMapStore.getState()
    const errorSpy = jest.spyOn(console, 'error')

    useMapInstanceStore.setState({ _map: fakeMap })
    useMapStore.setState({
      mapContext: 'ui-baseline',
      _layerGroups: {},
      _layerInstances: {},
      _layerGroupIdsBeingProcessed: new Set(),
      _dataSyncSubscriptions: {},
      _globalEventHandlers: { selectableLayers: [] },
    })

    try {
      await useMapStore.getState().addLayerGroup(
        UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID,
        {
          layerConf: customTestLayerConf,
          layerOrderOptions: {
            layerOrderLevel: LayerOrderLevel.LAYER,
          },
          isHidden: false,
          persist: false,
        },
        { skipQueue: true }
      )

      expect([...registeredSources.keys()]).toEqual([
        UI_BASELINE_CUSTOM_TEST_SOURCE_ID,
      ])
      expect(
        registeredLayers.map(({ id, type, source }) => ({ id, type, source }))
      ).toEqual(
        getStaticStyle().layers.map(({ id, type, source }) => ({
          id,
          type,
          source,
        }))
      )
      expect(errorSpy).not.toHaveBeenCalled()
    } finally {
      const subscriptions =
        useMapStore.getState()._dataSyncSubscriptions[
          UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID
        ]
      Object.values(subscriptions ?? {}).forEach((unsubscribe) => unsubscribe())
      useMapStore.setState(previousState, true)
      useMapInstanceStore.setState({ _map: previousMap })
      errorSpy.mockRestore()
    }
  })
})
