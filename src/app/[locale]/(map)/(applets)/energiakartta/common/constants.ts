import {
  LayerOrderLevel,
  ListedLayerGroup,
  ListedLayerMenuItem,
} from '#/common/types/map'
import BackgroundBuildingFiltersAccordionContent from '#/app/[locale]/(map)/(applets)/energiakartta/components/BackgroundBuildingFiltersAccordionContent'
import energymapBuildingPolygonsLayerConf from '#/app/[locale]/(map)/(applets)/energiakartta/layers/buildingPolygonsLayerConf'
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
  listedHeatingLayerGroup,
]
