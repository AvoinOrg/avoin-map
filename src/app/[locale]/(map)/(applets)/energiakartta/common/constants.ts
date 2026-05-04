import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import buildingEnergyCertificatesLayerConf from '#/components/Map/layers/main/Buildings/BuildingEnergyCertificates/layerConf'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedMmlTaustakarttaLayerGroup,
  listedOsmBackgroundLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'

export const listedEnergyClassesLayerGroup: ListedLayerGroup = {
  id: buildingEnergyCertificatesLayerConf.id,
  addOptions: {
    layerConf: buildingEnergyCertificatesLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.LAYER,
    },
    isHidden: true,
  },
  translationNs: 'energiakartta',
  nameTranslationKey: 'sidebar.front_page.layers.energy_classes',
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
  listedEnergyClassesLayerGroup,
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
]
