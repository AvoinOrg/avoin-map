import { LayerOrderLevel } from '#/common/types/map'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'

import {
  FOREST_USE_DECLARATIONS_DEFAULT_OPACITY,
  FOREST_USE_DECLARATIONS_LAYER_GROUP_ID,
} from '../layers/forestUseDeclarations'
import {
  listedForestUseDeclarationsLayerGroup,
  listedLayerGroups,
} from './constants'

const getListedLayerGroupIndex = (layerGroupId: string) =>
  listedLayerGroups.findIndex((layerGroup) => layerGroup.id === layerGroupId)

describe('Luonnonmetsakartat listed layer groups', () => {
  it('registers forest use declarations as a hidden background overlay layer', () => {
    expect(listedForestUseDeclarationsLayerGroup).toMatchObject({
      id: FOREST_USE_DECLARATIONS_LAYER_GROUP_ID,
      translationNs: 'luonnonmetsakartat',
      nameTranslationKey: 'layers.forest_use_declarations.name',
      thumbnail:
        '/files/img/layer-thumbnails/luonnonmetsakartat/forest-use-declarations.png',
      addOptions: {
        isHidden: true,
        layerOrderOptions: {
          layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
        },
      },
      styleOptions: {
        showOpacitySlider: true,
        defaultOpacity: FOREST_USE_DECLARATIONS_DEFAULT_OPACITY,
      },
    })
  })

  it('places the applet-specific overlay before generic cadastral overlays', () => {
    const forestUseDeclarationsIndex = getListedLayerGroupIndex(
      FOREST_USE_DECLARATIONS_LAYER_GROUP_ID
    )
    const cadastralBoundariesIndex = getListedLayerGroupIndex(
      listedMmlKiinteistojaotusLayerGroup.id
    )
    const propertyIdentifiersIndex = getListedLayerGroupIndex(
      listedMmlKiinteistotunnuksetLayerGroup.id
    )

    expect(forestUseDeclarationsIndex).toBeGreaterThanOrEqual(0)
    expect(cadastralBoundariesIndex).toBeGreaterThan(
      forestUseDeclarationsIndex
    )
    expect(propertyIdentifiersIndex).toBeGreaterThan(
      forestUseDeclarationsIndex
    )
  })
})
