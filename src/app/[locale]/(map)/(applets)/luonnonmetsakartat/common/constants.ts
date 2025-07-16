import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import { listedOsmBackgroundLayerGroup } from '#/components/Map/layers/defaultListedLayerGroups'
import { mmlTaustakarttaLayerConf } from '#/components/Map/layers/common/MML/taustakartta'
import { mmlMaastokarttaLayerConf } from '#/components/Map/layers/common/MML/maastokartta'
import { mmlOrtokuvaLayerConf } from '#/components/Map/layers/common/MML/ortokuva'
import { mmlSelkokarttaLayerConf } from '#/components/Map/layers/common/MML/selkokartta'
import { mmlKiinteistojaotusLayerConf } from '#/components/Map/layers/common/MML/kiinteistojaotus'
import { mmlKiinteistotunnuksetLayerConf } from '#/components/Map/layers/common/MML/kiinteistotunnukset'

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
    name: 'Taustakartta',
    translationNs: 'avoin-map',
    nameTranslationKey: 'layers.mml.taustakartta.description',
    thumbnail: '/files/img/layer-thumbnails/mml/taustakartta.png',
    // description: 'Base layers for the map',
    // descriptionTranslationKey: 'layers.osm.description',
  },
  {
    id: mmlMaastokarttaLayerConf.id,
    addOptions: {
      layerConf: mmlMaastokarttaLayerConf,
      layerOrderOptions: {
        layerOrderLevel: LayerOrderLevel.BACKGROUND,
        disableOthersInGroup: true,
      },
      isHidden: true,
    },
    // orderLevel: LayerOrderLevel.BACKGROUND,
    name: 'Maastokartta',
    translationNs: 'avoin-map',
    nameTranslationKey: 'layers.mml.maastokartta.description',
    thumbnail: '/files/img/layer-thumbnails/mml/maastokartta.jpg',
    // description: 'Base layers for the map',
    // descriptionTranslationKey: 'layers.osm.description',
  },
  {
    id: mmlOrtokuvaLayerConf.id,
    addOptions: {
      layerConf: mmlOrtokuvaLayerConf,
      layerOrderOptions: {
        layerOrderLevel: LayerOrderLevel.BACKGROUND,
        disableOthersInGroup: true,
      },
      isHidden: true,
    },
    // orderLevel: LayerOrderLevel.BACKGROUND,
    name: 'Ortokuva',
    translationNs: 'avoin-map',
    nameTranslationKey: 'layers.mml.ortokuva.description',
    thumbnail: '/files/img/layer-thumbnails/mml/ortokuva.jpg',
    // description: 'Base layers for the map',
    // descriptionTranslationKey: 'layers.osm.description',
  },
  {
    id: mmlSelkokarttaLayerConf.id,
    addOptions: {
      layerConf: mmlSelkokarttaLayerConf,
      layerOrderOptions: {
        layerOrderLevel: LayerOrderLevel.BACKGROUND,
        disableOthersInGroup: true,
      },
      isHidden: true,
    },
    // orderLevel: LayerOrderLevel.BACKGROUND,
    name: 'Selkokartta',
    translationNs: 'avoin-map',
    nameTranslationKey: 'layers.mml.selkokartta.description',
    thumbnail: '/files/img/layer-thumbnails/mml/selkokartta.jpg',
    // description: 'Base layers for the map',
    // descriptionTranslationKey: 'layers.osm.description',
  },
  {
    id: mmlKiinteistojaotusLayerConf.id,
    addOptions: {
      layerConf: mmlKiinteistojaotusLayerConf,
      layerOrderOptions: {
        layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
        // disableOthersInGroup: true,
      },
      isHidden: true,
    },
    // orderLevel: LayerOrderLevel.BACKGROUND,
    name: 'Kiinteistöjaotus',
    translationNs: 'avoin-map',
    nameTranslationKey: 'layers.mml.kiinteistojaotus.description',
    thumbnail: '/files/img/layer-thumbnails/mml/kiinteistojaotus.png',
    // description: 'Base layers for the map',
    // descriptionTranslationKey: 'layers.osm.description',
  },
  {
    id: mmlKiinteistotunnuksetLayerConf.id,
    addOptions: {
      layerConf: mmlKiinteistotunnuksetLayerConf,
      layerOrderOptions: {
        layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
        // disableOthersInGroup: true,
      },
      isHidden: true,
    },
    // orderLevel: LayerOrderLevel.BACKGROUND,
    name: 'Kiinteistötunnukset',
    translationNs: 'avoin-map',
    nameTranslationKey: 'layers.mml.kiinteistotunnukset.description',
    thumbnail: '/files/img/layer-thumbnails/mml/kiinteistotunnukset.png',
    // description: 'Base layers for the map',
    // descriptionTranslationKey: 'layers.osm.description',
  },
  {
    ...listedOsmBackgroundLayerGroup,
    addOptions: { ...listedOsmBackgroundLayerGroup.addOptions, isHidden: true },
  },
]
