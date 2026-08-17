import {
  INITIAL_LAYER_FIXTURE_FILTERS,
  getLayerFixtureData,
  useLayerFixtureStore,
} from './layerFixtureStore'

describe('ui-baseline layer fixture store', () => {
  beforeEach(() => {
    useLayerFixtureStore.getState().reset()
  })

  it('derives deterministic mock data for every filter family', () => {
    expect(getLayerFixtureData(INITIAL_LAYER_FIXTURE_FILTERS).features).toHaveLength(
      4
    )

    expect(
      getLayerFixtureData({
        ...INITIAL_LAYER_FIXTURE_FILTERS,
        datasetId: 'sample-points',
      }).features
    ).toHaveLength(2)
    expect(
      getLayerFixtureData({
        ...INITIAL_LAYER_FIXTURE_FILTERS,
        yearId: '2032',
      }).features
    ).toHaveLength(2)
    expect(
      getLayerFixtureData({
        ...INITIAL_LAYER_FIXTURE_FILTERS,
        includeDraftRecords: false,
      }).features
    ).toHaveLength(3)
    expect(
      getLayerFixtureData({
        ...INITIAL_LAYER_FIXTURE_FILTERS,
        showMockLabels: false,
      }).features.every(
        (feature) => feature.properties.displayLabel.length === 0
      )
    ).toBe(true)
  })

  it('updates store-backed GeoJSON and resets it', () => {
    const initialData = useLayerFixtureStore.getState().data

    useLayerFixtureStore.getState().setDatasetId('imaginary-routes')
    useLayerFixtureStore.getState().setYearId('2040')
    useLayerFixtureStore.getState().setIncludeDraftRecords(false)
    useLayerFixtureStore.getState().setShowMockLabels(false)

    const filteredState = useLayerFixtureStore.getState()
    expect(filteredState.data).not.toBe(initialData)
    expect(filteredState.data.features).toHaveLength(1)
    expect(filteredState.data.features[0].properties.displayLabel).toBe('')

    filteredState.reset()

    expect(useLayerFixtureStore.getState()).toMatchObject(
      INITIAL_LAYER_FIXTURE_FILTERS
    )
    expect(useLayerFixtureStore.getState().data.features).toHaveLength(4)
  })
})
