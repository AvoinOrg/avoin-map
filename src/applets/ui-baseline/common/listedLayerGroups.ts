import { LayerOrderLevel, type ListedLayerMenuItem } from '#/common/types/map'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedMmlTaustakarttaLayerGroup,
  listedOsmBackgroundLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'

import CustomTestLayersAccordionContent from '../components/CustomTestLayersAccordionContent'
import customTestLayerConf from '../layers/customTestLayerConf'
import { UI_BASELINE_NAMESPACE } from './categories'

export const listedCustomTestLayersAccordion: ListedLayerMenuItem = {
  id: customTestLayerConf.id,
  type: 'accordion',
  menuOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
  addOptions: {
    layerConf: customTestLayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.LAYER,
    },
    isHidden: false,
    persist: false,
  },
  translationNs: UI_BASELINE_NAMESPACE,
  titleTranslationKey: 'layers.custom_test_layers.title',
  ariaLabelTranslationKey: 'layers.custom_test_layers.aria_label',
  defaultExpanded: true,
  ContentComponent: CustomTestLayersAccordionContent,
}

export const uiBaselineListedLayerGroups: ListedLayerMenuItem[] = [
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
  listedCustomTestLayersAccordion,
  {
    ...listedMmlKiinteistojaotusLayerGroup,
    addOptions: {
      ...listedMmlKiinteistojaotusLayerGroup.addOptions,
      isHidden: false,
    },
  },
  listedMmlKiinteistotunnuksetLayerGroup,
]
