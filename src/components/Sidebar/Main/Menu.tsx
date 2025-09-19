'use client'

import { Box } from '@mui/material'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react' // note: 'overlayscrollbars-react'
// import styles from './Menu.module.css'
import { useTranslate } from '@tolgee/react'

import ImgAccordion from '#/components/Sidebar/Main/Accordion/ImgAccordion'
import { AccordionItem } from '#/components/Sidebar/Main/Accordion/AccordionItem'
import fiMatureForestsLayerConf from '#/components/Map/layers/main/Forests/FinlandMatureForests/layerConf'
import mangroveForestsLayerConf from '#/components/Map/layers/main/Forests/MangroveForests/layerConf'
import treePlantationsLayerConf from '#/components/Map/layers/main/Forests/TreePlantations/layerConf'
import hansenLayerConf from '#/components/Map/layers/main/Forests/Hansen/layerConf'
import {
  ForestContent,
  BiodiversityContent,
  WetlandsContent,
  BuildingsContent,
  AirQualityContent,
  SnowCoverLossContent,
  MatureForestContent,
  MangroveForestContent,
  TropicalForestContent,
  ForestCoverageContent,
} from './Accordion'
import { AOAccordionLink } from './Accordion'
import { AccordionLink } from './Accordion/AccordionLink'

export const MainMenu = () => {
  const { t } = useTranslate('avoin-map')

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        maxWidth: 400,
        flex: 1,
      }}
    >
      <OverlayScrollbarsComponent
        className="osScroll"
        options={{
          overflow: { x: 'hidden', y: 'scroll' }, // make THIS the scroller
          scrollbars: {
            theme: 'os-theme-dark',
            autoHide: 'leave',
            autoHideDelay: 600,
          },
        }}
      >
        <ImgAccordion
          title={t('sidebar.forests')}
          img="/files/img/main-menu/main_menu_forests.jpg"
        >
          <AccordionLink
            href="/fi-forest"
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
            layerConf={mangroveForestsLayerConf}
            name={t('sidebar.layers.mangrove_forests')}
          >
            <MangroveForestContent />
          </AccordionItem> */}
          <AccordionItem
            layerConf={treePlantationsLayerConf}
            name={t('sidebar.layers.tree_plantations')}
          >
            <TropicalForestContent />
          </AccordionItem>
        </ImgAccordion>
        <ImgAccordion
          title="Biodiversity"
          img="/files/img/main-menu/main_menu_forests.jpg"
        >
          <BiodiversityContent />
        </ImgAccordion>
        <ImgAccordion
          title="Wetlands"
          img="/files/img/main-menu/main_menu_forests.jpg"
        >
          <WetlandsContent />
        </ImgAccordion>
        <ImgAccordion
          title="Buildings"
          img="/files/img/main-menu/main_menu_forests.jpg"
        >
          <BuildingsContent />
        </ImgAccordion>
        <ImgAccordion
          title="Air quality"
          img="/files/img/main-menu/main_menu_forests.jpg"
        >
          <AirQualityContent />
        </ImgAccordion>
        <ImgAccordion
          title="Snow cover loss"
          img="/files/img/main-menu/main_menu_forests.jpg"
        >
          <SnowCoverLossContent />
        </ImgAccordion>
      </OverlayScrollbarsComponent>
    </Box>
  )
}
