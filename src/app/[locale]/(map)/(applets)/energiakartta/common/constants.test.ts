import { LayerOrderLevel } from '#/common/types/map'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'
import { listedHeatingLayerGroup, listedLayerGroups } from './constants'

const getListedLayerGroupIndex = (layerGroupId: string) =>
  listedLayerGroups.findIndex((layerGroup) => layerGroup.id === layerGroupId)

describe('Energiakartta listed layer groups', () => {
  it('keeps heating in the normal data layer order level', () => {
    expect(
      listedHeatingLayerGroup.addOptions.layerOrderOptions?.layerOrderLevel
    ).toBe(LayerOrderLevel.LAYER)
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
})
