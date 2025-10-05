'use client'

import { Box } from '@mui/material'
import { useTranslate } from '@tolgee/react'

import ImgAccordion from '#/components/Sidebar/Main/Accordion/ImgAccordion'
import { AccordionItem } from '#/components/Sidebar/Main/Accordion/AccordionItem'
import { AccordionLink } from '#/components/Sidebar/Main/Accordion/AccordionLink'

// Layer Confs
import fiMatureForestsLayerConf from '#/components/Map/layers/main/Forests/FinlandMatureForests/layerConf'
import treePlantationsLayerConf from '#/components/Map/layers/main/Forests/TreePlantations/layerConf'
import hansenLayerConf from '#/components/Map/layers/main/Forests/Hansen/layerConf'
import metsaanEteBasicLayerConf from '#/components/Map/layers/main/Biodiversity/MetsaanEteBasic/layerConf'
import metsaanEteImportantLayerConf from '#/components/Map/layers/main/Biodiversity/MetsaanEteImportant/layerConf'
import zonationLayerConf from '#/components/Map/layers/main/Biodiversity/Zonation/layerConf'
import natura2000LayerConf from '#/components/Map/layers/main/Biodiversity/Natura2000/layerConf'
import fiBogsLayerConf from '#/components/Map/layers/main/Wetlands/FinlandBogs/layerConf'
import ciforPeatlandsLayerConf from '#/components/Map/layers/main/Wetlands/CiforPeatlands/layerConf'
import ciforWetlandsLayerConf from '#/components/Map/layers/main/Wetlands/CiforWetlands/layerConf'
import buildingEnergyCertsLayerConf from '#/components/Map/layers/main/Buildings/BuildingEnergyCertificates/layerConf'
import helsinkiBuildingsLayerConf from '#/components/Map/layers/main/Buildings/HelsinkiBuildings/layerConf'
import hsySolarpotentialLayerConf from '#/components/Map/layers/main/Buildings/HsySolarPotential/layerConf'
import airQualityLayerConf from '#/components/Map/layers/main/AirQuality/layerConf'
import snowCoverLossLayerConf from '#/components/Map/layers/main/SnowCoverLoss/layerConf'

// Content Components
import {
  MatureForestContent,
  TropicalForestContent,
  ForestCoverageContent,
} from './Accordion/ForestContent/ForestContent'
import { FiZonationContent } from './Accordion/BiodiversityContent/BiodiversityContent'
import {
  AirQualityContent,
  SnowCoverLossContent,
} from './Accordion/OtherContent/OtherContent'
import SidebarContentBox from '../SidebarContentBox'

export const MainMenu = () => {
  const { t } = useTranslate('avoin-map')

  return (
    <SidebarContentBox sxInner={{ p: 0 }}>
      <ImgAccordion
        title={t('sidebar.forests')}
        img="/files/img/green-drawings/forest-mountains.jpg"
      >
        <AccordionLink
          href="/forests"
          name={t('sidebar.layers.finland_forests')}
        />
        <AccordionItem
          layerConf={hansenLayerConf}
          name={t('sidebar.layers.global_forest_coverage')}
        >
          <ForestCoverageContent />
        </AccordionItem>
        <AccordionItem
          layerConf={fiMatureForestsLayerConf}
          name={t('sidebar.layers.mature_forests')}
        >
          <MatureForestContent />
        </AccordionItem>
        {/* <AccordionItem
            layerConf={treePlantationsLayerConf}
            name={t('sidebar.layers.tree_plantations')}
          >
            <TropicalForestContent />
          </AccordionItem> */}
      </ImgAccordion>
      <ImgAccordion
        title={t('sidebar.buildings')}
        img="/files/img/green-drawings/buildings.jpg"
      >
        <AccordionItem
          layerConf={buildingEnergyCertsLayerConf}
          name={t('sidebar.layers.building_energy_certificates')}
        />
        <AccordionItem
          layerConf={helsinkiBuildingsLayerConf}
          name={t('sidebar.layers.buildings_helsinki')}
        />
        <AccordionItem
          layerConf={hsySolarpotentialLayerConf}
          name={t('sidebar.layers.helsinki_solar_power_potential')}
        />
      </ImgAccordion>
      <ImgAccordion
        title={t('sidebar.biodiversity')}
        img="/files/img/green-drawings/animals.jpg"
      >
        <AccordionItem
          layerConf={metsaanEteBasicLayerConf}
          name={t('sidebar.layers.potential_metso_areas')}
        />
        <AccordionItem
          layerConf={metsaanEteImportantLayerConf}
          name={t('sidebar.layers.especially_important_habitats')}
        />
        <AccordionItem
          layerConf={zonationLayerConf}
          name={t('sidebar.layers.areas_important_to_biodiversity')}
        >
          <FiZonationContent />
        </AccordionItem>
        <AccordionItem
          layerConf={natura2000LayerConf}
          name={t('sidebar.layers.natura_2000')}
        />
      </ImgAccordion>
      <ImgAccordion
        title={t('sidebar.wetlands')}
        img="/files/img/green-drawings/bugs.jpg"
      >
        <AccordionItem
          layerConf={fiBogsLayerConf}
          name={t('sidebar.layers.bogs_and_swamps')}
        />
        <AccordionItem
          layerConf={ciforPeatlandsLayerConf}
          name={t('sidebar.layers.tropical_peatlands')}
        />
        <AccordionItem
          layerConf={ciforWetlandsLayerConf}
          name={t('sidebar.layers.tropical_wetlands')}
        />
      </ImgAccordion>

      <ImgAccordion
        title={t('sidebar.other')}
        img="/files/img/green-drawings/dam.jpg"
      >
        <AccordionItem
          layerConf={airQualityLayerConf}
          name={t('sidebar.layers.air_pollution_no2')}
        >
          <AirQualityContent />
        </AccordionItem>
        <AccordionItem
          layerConf={snowCoverLossLayerConf}
          name={t('sidebar.layers.snow_cover_loss')}
        >
          <SnowCoverLossContent />
        </AccordionItem>
      </ImgAccordion>
    </SidebarContentBox>
  )
}
