import { LayerOrderLevel } from '#/common/types/map'
import {
  getListedLayerMenuOrderLevel,
  isLayerBackedListedLayerItem,
  isListedLayerAccordionItem,
} from '#/common/utils/listedLayerGroups'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'
import {
  listedBackgroundBuildingFiltersAccordion,
  listedHeatingLayerGroup,
  listedLayerGroups,
} from './constants'

const getListedLayerGroupIndex = (layerGroupId: string) =>
  listedLayerGroups.findIndex((layerGroup) => layerGroup.id === layerGroupId)

describe('Energiakartta listed layer groups', () => {
  it('keeps heating in the normal data layer order level', () => {
    expect(
      listedHeatingLayerGroup.addOptions.layerOrderOptions?.layerOrderLevel
    ).toBe(LayerOrderLevel.LAYER)
  })

  it('shows the building filter accordion in background overlays while drawing as a data layer', () => {
    expect(
      isListedLayerAccordionItem(listedBackgroundBuildingFiltersAccordion)
    ).toBe(true)
    expect(
      getListedLayerMenuOrderLevel(listedBackgroundBuildingFiltersAccordion)
    ).toBe(LayerOrderLevel.BACKGROUND_OVERLAY)
    expect(
      isLayerBackedListedLayerItem(listedBackgroundBuildingFiltersAccordion)
    ).toBe(true)

    if (
      isLayerBackedListedLayerItem(listedBackgroundBuildingFiltersAccordion)
    ) {
      expect(
        listedBackgroundBuildingFiltersAccordion.addOptions.layerOrderOptions
          .layerOrderLevel
      ).toBe(LayerOrderLevel.LAYER)
      expect(listedBackgroundBuildingFiltersAccordion.addOptions.isHidden).toBe(
        false
      )
    }
  })

  it('keeps cadastral layers in the background overlay order level', () => {
    expect(
      listedMmlKiinteistojaotusLayerGroup.addOptions.layerOrderOptions
        ?.layerOrderLevel
    ).toBe(LayerOrderLevel.BACKGROUND_OVERLAY)
    expect(
      listedMmlKiinteistotunnuksetLayerGroup.addOptions.layerOrderOptions
        ?.layerOrderLevel
    ).toBe(LayerOrderLevel.BACKGROUND_OVERLAY)
  })

  it('registers heating after cadastral background overlays', () => {
    const heatingIndex = getListedLayerGroupIndex(listedHeatingLayerGroup.id)
    const cadastralBoundariesIndex = getListedLayerGroupIndex(
      listedMmlKiinteistojaotusLayerGroup.id
    )
    const propertyIdentifiersIndex = getListedLayerGroupIndex(
      listedMmlKiinteistotunnuksetLayerGroup.id
    )

    expect(heatingIndex).toBeGreaterThan(cadastralBoundariesIndex)
    expect(heatingIndex).toBeGreaterThan(propertyIdentifiersIndex)
  })

  it('keeps cadastral rows below and outside the building filter accordion', () => {
    const buildingFiltersIndex = getListedLayerGroupIndex(
      listedBackgroundBuildingFiltersAccordion.id
    )
    const cadastralBoundariesIndex = getListedLayerGroupIndex(
      listedMmlKiinteistojaotusLayerGroup.id
    )
    const propertyIdentifiersIndex = getListedLayerGroupIndex(
      listedMmlKiinteistotunnuksetLayerGroup.id
    )

    expect(buildingFiltersIndex).toBeGreaterThanOrEqual(0)
    expect(cadastralBoundariesIndex).toBeGreaterThan(buildingFiltersIndex)
    expect(propertyIdentifiersIndex).toBeGreaterThan(buildingFiltersIndex)
  })
})
