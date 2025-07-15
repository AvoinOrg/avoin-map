import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import { listedOsmBackgroundLayerGroup } from '#/components/Map/layers/defaultListedLayerGroups'
import { mmlTaustakarttaLayerConf } from '#/components/Map/layers/common/MML/taustakartta'

export const listedLayerGroups: ListedLayerGroup[] = [
  {
    id: mmlTaustakarttaLayerConf.id,
    addOptions: {
      layerConf: mmlTaustakarttaLayerConf,
      layerOrderOptions: {
        layerOrderLevel: LayerOrderLevel.BACKGROUND,
        disableOthersInGroup: true,
      },
    },
    // orderLevel: LayerOrderLevel.BACKGROUND,
    name: 'MML taustakartta',
    translationNs: 'avoin-map',
    nameTranslationKey: 'layers.osm.description',
    thumbnail: '/files/img/layer-thumbnails/osm/background.jpg',
    // description: 'Base layers for the map',
    // descriptionTranslationKey: 'layers.osm.description',
  },
  {
    ...listedOsmBackgroundLayerGroup,
    addOptions: { ...listedOsmBackgroundLayerGroup.addOptions, isHidden: true },
  },
]
