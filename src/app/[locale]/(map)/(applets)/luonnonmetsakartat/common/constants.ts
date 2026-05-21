import { LayerOrderLevel, type ListedLayerGroup } from '#/common/types/map'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedMmlTaustakarttaLayerGroup,
  listedOsmBackgroundLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'
import {
  FOREST_USE_DECLARATIONS_DEFAULT_OPACITY,
  forestUseDeclarationsLayerConf,
} from '../layers/forestUseDeclarations'

export const listedForestUseDeclarationsLayerGroup: ListedLayerGroup = {
  id: forestUseDeclarationsLayerConf.id,
  addOptions: {
    layerConf: forestUseDeclarationsLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
    },
    isHidden: true,
  },
  translationNs: 'luonnonmetsakartat',
  nameTranslationKey: 'layers.forest_use_declarations.name',
  thumbnail:
    '/files/img/layer-thumbnails/luonnonmetsakartat/forest-use-declarations.png',
  styleOptions: {
    showOpacitySlider: true,
    defaultOpacity: FOREST_USE_DECLARATIONS_DEFAULT_OPACITY,
  },
}

export const listedLayerGroups: ListedLayerGroup[] = [
  {
    ...listedMmlTaustakarttaLayerGroup,
    addOptions: {
      ...listedMmlTaustakarttaLayerGroup.addOptions,
      isHidden: false,
    },
  },
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedForestUseDeclarationsLayerGroup,
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedOsmBackgroundLayerGroup,
]
