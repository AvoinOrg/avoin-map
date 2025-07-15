import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import { osmBackgroundLayerConf } from '#/components/Map/layers/common/OSM/background'

export const listedOsmBackgroundLayerGroup: ListedLayerGroup = {
  id: osmBackgroundLayerConf.id,
  addOptions: {
    layerConf: osmBackgroundLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
      disableOthersInGroup: true,
    },
  },
  // orderLevel: LayerOrderLevel.BACKGROUND,
  name: 'OpenStreetMap',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.osm.description',
  thumbnail: '/files/img/layer-thumbnails/osm/background.jpg',
  // description: 'Base layers for the map',
  // descriptionTranslationKey: 'layers.osm.description',
}

export const defaultListedLayerGroups: ListedLayerGroup[] = [
  listedOsmBackgroundLayerGroup,
]
