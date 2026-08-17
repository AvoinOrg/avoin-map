import customTestLayerConf, {
  UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID,
  UI_BASELINE_CUSTOM_TEST_SOURCE_ID,
} from './customTestLayerConf'

describe('ui-baseline custom test layer', () => {
  it('uses only a local store-backed GeoJSON source and ui-baseline ids', () => {
    expect(customTestLayerConf.id).toBe(UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID)
    expect(typeof customTestLayerConf.style).toBe('object')

    if (typeof customTestLayerConf.style === 'function') {
      throw new Error('Expected a static fixture style')
    }

    const source = customTestLayerConf.style.sources[
      UI_BASELINE_CUSTOM_TEST_SOURCE_ID
    ]

    expect(source.type).toBe('store')
    expect(source).not.toHaveProperty('url')
    expect(source).not.toHaveProperty('tiles')
    expect(customTestLayerConf.style.layers).toHaveLength(4)
    expect(JSON.stringify(customTestLayerConf).toLowerCase()).not.toMatch(
      /energy|building|heating|certificate/
    )
  })
})
