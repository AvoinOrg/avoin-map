import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import energymapBuildingPolygonsLayerConf from '#/app/[locale]/(map)/(applets)/energiakartta/layers/buildingPolygonsLayerConf'
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
  id: energymapBuildingPolygonsLayerConf.id,
  addOptions: {
    layerConf: energymapBuildingPolygonsLayerConf,
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
