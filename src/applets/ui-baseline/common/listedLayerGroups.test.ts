import { LayerOrderLevel } from '#/common/types/map'
import { osmBackgroundLayerConf } from '#/components/Map/layers/common/OSM/background'
import { mmlKiinteistojaotusLayerConf } from '#/components/Map/layers/common/MML/kiinteistojaotus'
import { flattenLayerBackedListedLayerItems } from '#/common/utils/listedLayerGroups'

import { UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID } from '../layers/customTestLayerConf'
import {
  listedCustomTestLayersAccordion,
  uiBaselineListedLayerGroups,
} from './listedLayerGroups'

describe('ui-baseline listed layer groups', () => {
  it('declares deterministic fresh-entry visibility without Energy layers', () => {
    const layerBackedItems = flattenLayerBackedListedLayerItems(
      uiBaselineListedLayerGroups
    )
    const visibleIds = layerBackedItems
      .filter((item) => item.addOptions.isHidden === false)
      .map((item) => item.id)

    expect(visibleIds).toEqual([
      osmBackgroundLayerConf.id,
      UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID,
      mmlKiinteistojaotusLayerConf.id,
    ])
    expect(JSON.stringify(uiBaselineListedLayerGroups).toLowerCase()).not.toMatch(
      /energy|building|heating|certificate/
    )
  })

  it('separates the custom accordion menu order from its drawing order', () => {
    expect(listedCustomTestLayersAccordion).toMatchObject({
      id: UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID,
      type: 'accordion',
      menuOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
      translationNs: 'ui-baseline',
      addOptions: {
        isHidden: false,
        persist: false,
        layerOrderOptions: {
          layerOrderLevel: LayerOrderLevel.LAYER,
        },
      },
    })
  })

  it('keeps every listed item id unique', () => {
    const ids = uiBaselineListedLayerGroups.map((item) => item.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})
