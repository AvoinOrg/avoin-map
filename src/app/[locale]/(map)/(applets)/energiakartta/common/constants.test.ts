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
  ENERGYMAP_MAIN_LAYER_GROUP_IDS,
  listedBackgroundBuildingFiltersAccordion,
  listedEnergyCertificateLayerGroup,
  listedHeatingLayerGroup,
  listedLayerGroups,
} from './constants'
import { ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID } from '../layers/buildingPolygonsLayerConf'
import { ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID } from '../layers/energyCertificateLayerConf'
import { ENERGYMAP_HEATING_LAYER_GROUP_ID } from '../layers/heatingLayerConf'

const getListedLayerGroupIndex = (layerGroupId: string) =>
  listedLayerGroups.findIndex((layerGroup) => layerGroup.id === layerGroupId)

describe('Energiakartta listed layer groups', () => {
  it('keeps energy certificates and heating in the normal data layer order level', () => {
    expect(
      listedEnergyCertificateLayerGroup.addOptions.layerOrderOptions
        ?.layerOrderLevel
    ).toBe(LayerOrderLevel.LAYER)
    expect(
      listedHeatingLayerGroup.addOptions.layerOrderOptions?.layerOrderLevel
    ).toBe(LayerOrderLevel.LAYER)
  })

  it('keeps energy certificates and heating hidden until their rows are enabled', () => {
    expect(listedEnergyCertificateLayerGroup.addOptions.isHidden).toBe(true)
    expect(listedHeatingLayerGroup.addOptions.isHidden).toBe(true)
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

  it('keeps only main Energiakartta layer views in the exclusivity set', () => {
    expect(ENERGYMAP_MAIN_LAYER_GROUP_IDS).toEqual([
      ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID,
      ENERGYMAP_HEATING_LAYER_GROUP_ID,
    ])
    expect(ENERGYMAP_MAIN_LAYER_GROUP_IDS).not.toContain(
      ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID
    )
  })

  it('registers energy certificates and heating after cadastral background overlays', () => {
    const energyCertificateIndex = getListedLayerGroupIndex(
      listedEnergyCertificateLayerGroup.id
    )
    const heatingIndex = getListedLayerGroupIndex(listedHeatingLayerGroup.id)
    const cadastralBoundariesIndex = getListedLayerGroupIndex(
      listedMmlKiinteistojaotusLayerGroup.id
    )
    const propertyIdentifiersIndex = getListedLayerGroupIndex(
      listedMmlKiinteistotunnuksetLayerGroup.id
    )

    expect(energyCertificateIndex).toBeGreaterThan(cadastralBoundariesIndex)
    expect(energyCertificateIndex).toBeGreaterThan(propertyIdentifiersIndex)
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
