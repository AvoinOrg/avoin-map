import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import { osmBackgroundLayerConf } from '#/components/Map/layers/common/OSM/background'
import { mmlTaustakarttaLayerConf } from '#/components/Map/layers/common/MML/taustakartta'
import { mmlMaastokarttaLayerConf } from '#/components/Map/layers/common/MML/maastokartta'
import { mmlOrtokuvaLayerConf } from '#/components/Map/layers/common/MML/ortokuva'
import { mmlSelkokarttaLayerConf } from '#/components/Map/layers/common/MML/selkokartta'
import { mmlKiinteistojaotusLayerConf } from '#/components/Map/layers/common/MML/kiinteistojaotus'
import { mmlKiinteistotunnuksetLayerConf } from '#/components/Map/layers/common/MML/kiinteistotunnukset'

export const listedOsmBackgroundLayerGroup: ListedLayerGroup = {
  id: osmBackgroundLayerConf.id,
  addOptions: {
    layerConf: osmBackgroundLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
      disableOthersInGroup: true,
    },
    isHidden: true,
  },
  // orderLevel: LayerOrderLevel.BACKGROUND,
  name: 'OpenStreetMap',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.osm.background.name',
  thumbnail: '/files/img/layer-thumbnails/osm/background.jpg',
  // description: 'Base layers for the map',
  // descriptionTranslationKey: 'layers.osm.name',
}

export const listedMmlTaustakarttaLayerGroup: ListedLayerGroup = {
  id: mmlTaustakarttaLayerConf.id,
  addOptions: {
    layerConf: mmlTaustakarttaLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
      disableOthersInGroup: true,
    },
    isHidden: true,
  },
  name: 'MML Background Map',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.mml.taustakartta.name',
  thumbnail: '/files/img/layer-thumbnails/mml/taustakartta.png',
}

export const listedMmlMaastokarttaLayerGroup: ListedLayerGroup = {
  id: mmlMaastokarttaLayerConf.id,
  addOptions: {
    layerConf: mmlMaastokarttaLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
      disableOthersInGroup: true,
    },
    isHidden: true,
  },
  name: 'MML Topographic Map',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.mml.maastokartta.name',
  thumbnail: '/files/img/layer-thumbnails/mml/maastokartta.jpg',
}

export const listedMmlOrtokuvaLayerGroup: ListedLayerGroup = {
  id: mmlOrtokuvaLayerConf.id,
  addOptions: {
    layerConf: mmlOrtokuvaLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
      disableOthersInGroup: true,
    },
    isHidden: true,
  },
  name: 'MML Orthophoto',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.mml.ortokuva.name',
  thumbnail: '/files/img/layer-thumbnails/mml/ortokuva.jpg',
}

export const listedMmlSelkokarttaLayerGroup: ListedLayerGroup = {
  id: mmlSelkokarttaLayerConf.id,
  addOptions: {
    layerConf: mmlSelkokarttaLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
      disableOthersInGroup: true,
    },
    isHidden: true,
  },
  name: 'MML Plain Map',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.mml.selkokartta.name',
  thumbnail: '/files/img/layer-thumbnails/mml/selkokartta.jpg',
}

export const listedMmlKiinteistojaotusLayerGroup: ListedLayerGroup = {
  id: mmlKiinteistojaotusLayerConf.id,
  addOptions: {
    layerConf: mmlKiinteistojaotusLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
    },
    isHidden: true,
  },
  name: 'MML Cadastral Boundaries',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.mml.kiinteistojaotus.name',
  thumbnail: '/files/img/layer-thumbnails/mml/kiinteistojaotus.png',
}

export const listedMmlKiinteistotunnuksetLayerGroup: ListedLayerGroup = {
  id: mmlKiinteistotunnuksetLayerConf.id,
  addOptions: {
    layerConf: mmlKiinteistotunnuksetLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
    },
    isHidden: true,
  },
  name: 'MML Property Identifiers',
  translationNs: 'avoin-map',
  nameTranslationKey: 'layers.mml.kiinteistotunnukset.name',
  thumbnail: '/files/img/layer-thumbnails/mml/kiinteistotunnukset.png',
}

export const defaultListedLayerGroups: ListedLayerGroup[] = [
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
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
]
