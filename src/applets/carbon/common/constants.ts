// Hiilikartta applet constants for layers, zoning codes, and color ramps.
import React from 'react'
import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedMmlTaustakarttaLayerGroup,
  listedOsmBackgroundLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'
import LayerLegend from '#/components/common/LayerLegend'
import { vegetationCO2LayerConf } from '../layers/vegetationCO2'
import { CarbonChangeColorItem, ForestryScenarioId } from './types'

const listedHiilikarttaKasvillisuudenHiiliLayerGroup: ListedLayerGroup = {
  id: vegetationCO2LayerConf.id,
  addOptions: {
    layerConf: vegetationCO2LayerConf,
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
    },
    isHidden: false,
  },
  translationNs: 'hiilikartta',
  nameTranslationKey: 'layers.vegetation_co2.name',
  thumbnail: '/files/img/layer-thumbnails/osm/background.jpg',
  infoElement: React.createElement(LayerLegend, {
    items: [
      {
        color: '#FFFFFF',
        translationNs: 'hiilikartta',
        labelTranslationKey: 'layer.vegetation_co2.legend.bin0',
      },
      // {
      //   color: '#DDF5D0',
      //   translationNs: 'hiilikartta',
      //   labelTranslationKey: 'layer.vegetation_co2.legend.bin1',
      // },
      // {
      //   color: '#B6EFA5',
      //   translationNs: 'hiilikartta',
      //   labelTranslationKey: 'layer.vegetation_co2.legend.bin2',
      // },
      // {
      //   color: '#7DE46F',
      //   translationNs: 'hiilikartta',
      //   labelTranslationKey: 'layer.vegetation_co2.legend.bin3',
      // },
      {
        color: '#2ECC40',
        translationNs: 'hiilikartta',
        labelTranslationKey: 'layer.vegetation_co2.legend.bin4',
      },
    ],
  }),
  styleOptions: {
    showOpacitySlider: true,
    defaultOpacity: 0.6,
  },
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
  listedHiilikarttaKasvillisuudenHiiliLayerGroup,
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
]

export const CUSTOM_ZONING_CODE = 'OMA'
export const POWERLINE_ZONING_CLASS_PREFIX = 'ENs'

export const CARBON_CHANGE_COLORS: CarbonChangeColorItem[] = [
  { min: -1000, max: -500, color: '#C54032' },
  { min: -500, max: -250, color: '#F25050' },
  { min: -250, max: -100, color: '#E9B76D' },
  { min: -100, max: -10, color: '#F3F577' },
  { min: -1, max: 1, color: '#E7E8BF' },
  { min: 10, max: 100, color: '#C7DAD5' },
  { min: 100, max: 250, color: '#AAC0BC' },
  { min: 250, max: 500, color: '#87A19D' },
  { min: 500, max: 1000, color: '#568175' },
]

export const CARBON_CHANGE_NO_DATA_COLOR = '#D9D9D9'

export const DEFAULT_FORESTRY_SCENARIO: ForestryScenarioId = 1

export const FORESTRY_SCENARIOS = [
  {
    id: 1 as ForestryScenarioId,
    code: 'managed_forestry',
  },
  {
    id: 2 as ForestryScenarioId,
    code: 'no_logging',
  },
  {
    id: 3 as ForestryScenarioId,
    code: 'recreational_forest',
  },
] as const

export const ZONING_CLASS_COLORS_BY_CODE: Record<string, string> = {
  [CUSTOM_ZONING_CODE]: '#3bf63eff',
  A: '#C6AA76',
  AK: '#AC9F75',
  C: '#BF0D3E',
  P: '#ECA154',
  Y: '#ECA154',
  K: '#ECA154',
  T: '#651D32',
  V: '#91C368',
  R: '#FED141',
  L: '#E5D381',
  E: '#E4C2CA',
  EH: '#2DCCD3',
  EV: '#2DCCD3',
  S: '#9CDBD9',
  M: '#D0DF00',
  MT: '#E3E48D',
  ME: '#ADA400',
  W: '#B9D9EB',
}
