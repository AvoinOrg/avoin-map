import {
  LayerOrderLevel,
  ListedLayerGroup,
  ListedLayerMenuItem,
} from '#/common/types/map'
import BackgroundBuildingFiltersAccordionContent from '#/app/[locale]/(map)/(applets)/energiakartta/components/BackgroundBuildingFiltersAccordionContent'
import energymapBuildingPolygonsLayerConf from '#/app/[locale]/(map)/(applets)/energiakartta/layers/buildingPolygonsLayerConf'
import energymapEnergyCertificateLayerConf, {
  ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID,
} from '#/app/[locale]/(map)/(applets)/energiakartta/layers/energyCertificateLayerConf'
import energymapHeatingLayerConf, {
  ENERGYMAP_HEATING_LAYER_GROUP_ID,
} from '#/app/[locale]/(map)/(applets)/energiakartta/layers/heatingLayerConf'
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

export const listedEnergyCertificateLayerGroup: ListedLayerGroup = {
  id: energymapEnergyCertificateLayerConf.id,
  addOptions: {
    layerConf: energymapEnergyCertificateLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.LAYER,
    },
    isHidden: true,
  },
  translationNs: 'energiakartta',
  nameTranslationKey: 'sidebar.front_page.layers.energy_classes',
}

export const ENERGYMAP_MAIN_LAYER_GROUP_IDS = [
  ENERGYMAP_ENERGY_CERTIFICATE_LAYER_GROUP_ID,
  ENERGYMAP_HEATING_LAYER_GROUP_ID,
] as const

export const listedBackgroundBuildingFiltersAccordion: ListedLayerMenuItem = {
  id: energymapBuildingPolygonsLayerConf.id,
  type: 'accordion',
  menuOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
  addOptions: {
    layerConf: energymapBuildingPolygonsLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.LAYER,
    },
    isHidden: false,
  },
  translationNs: 'energiakartta',
  titleTranslationKey: 'sidebar.background_filters.accordion.title',
  ariaLabelTranslationKey: 'sidebar.background_filters.accordion.aria_label',
  backgroundImageSrc:
    '/files/img/energiakartta/sidebar/main-hero-header-crop.jpg',
  defaultExpanded: true,
  ContentComponent: BackgroundBuildingFiltersAccordionContent,
}

export const listedLayerGroups: ListedLayerMenuItem[] = [
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
  listedBackgroundBuildingFiltersAccordion,
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedEnergyCertificateLayerGroup,
  listedHeatingLayerGroup,
]
