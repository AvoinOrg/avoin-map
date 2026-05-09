import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import energymapHeatingLayerConf from '#/app/[locale]/(map)/(applets)/energiakartta/layers/heatingLayerConf'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedMmlTaustakarttaLayerGroup,
  listedOsmBackgroundLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'

export const listedHeatingLayerGroup: ListedLayerGroup = {
  id: energymapHeatingLayerConf.id,
  addOptions: {
    layerConf: energymapHeatingLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.LAYER,
    },
    isHidden: true,
  },
  translationNs: 'energiakartta',
  nameTranslationKey: 'sidebar.front_page.layers.heating',
}

export const listedLayerGroups: ListedLayerGroup[] = [
  {
    ...listedOsmBackgroundLayerGroup,
    addOptions: {
      ...listedOsmBackgroundLayerGroup.addOptions,
      isHidden: false,
    },
  },
  listedMmlTaustakarttaLayerGroup,
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedHeatingLayerGroup,
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
]
