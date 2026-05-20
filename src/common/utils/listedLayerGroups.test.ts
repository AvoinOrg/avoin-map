import { LayerOrderLevel } from '#/common/types/map'
import type { ListedLayerMenuItem } from '#/common/types/map'
import {
  flattenLayerBackedListedLayerItems,
  getListedLayerMenuOrderLevel,
  isLayerBackedListedLayerItem,
  isListedLayerAccordionItem,
  isListedLayerGroup,
} from './listedLayerGroups'

const createLayerItem = (
  id: string,
  layerOrderLevel: LayerOrderLevel
): ListedLayerMenuItem => ({
  id,
  addOptions: {
    layerOrderOptions: {
      layerOrderLevel,
    },
  },
  translationNs: 'test',
  nameTranslationKey: `layers.${id}`,
})

describe('listed layer group helpers', () => {
  it('keeps normal listed layer groups detectable as normal rows', () => {
    const item = createLayerItem('normal-layer', LayerOrderLevel.BACKGROUND)

    expect(isListedLayerGroup(item)).toBe(true)
    expect(isListedLayerAccordionItem(item)).toBe(false)
    expect(isLayerBackedListedLayerItem(item)).toBe(true)
    expect(getListedLayerMenuOrderLevel(item)).toBe(LayerOrderLevel.BACKGROUND)
  })

  it('uses the accordion menu order separately from its drawing order', () => {
    const item: ListedLayerMenuItem = {
      id: 'accordion-layer',
      type: 'accordion',
      menuOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
      translationNs: 'test',
      titleTranslationKey: 'layers.accordion',
      addOptions: {
        layerOrderOptions: {
          layerOrderLevel: LayerOrderLevel.LAYER,
        },
      },
    }

    expect(isListedLayerAccordionItem(item)).toBe(true)
    expect(isLayerBackedListedLayerItem(item)).toBe(true)
    expect(getListedLayerMenuOrderLevel(item)).toBe(
      LayerOrderLevel.BACKGROUND_OVERLAY
    )
  })

  it('flattens layer-backed accordion rows and nested layer rows for registration', () => {
    const nestedLayer = createLayerItem('nested-layer', LayerOrderLevel.OVERLAY)
    const items: ListedLayerMenuItem[] = [
      createLayerItem('normal-layer', LayerOrderLevel.BACKGROUND),
      {
        id: 'display-only-accordion',
        type: 'accordion',
        menuOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
        translationNs: 'test',
        titleTranslationKey: 'layers.display_only',
        items: [nestedLayer],
      },
      {
        id: 'backed-accordion',
        type: 'accordion',
        menuOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
        translationNs: 'test',
        titleTranslationKey: 'layers.backed',
        addOptions: {
          layerOrderOptions: {
            layerOrderLevel: LayerOrderLevel.LAYER,
          },
        },
      },
    ]

    expect(
      flattenLayerBackedListedLayerItems(items).map((item) => item.id)
    ).toEqual(['normal-layer', 'nested-layer', 'backed-accordion'])
  })
})
