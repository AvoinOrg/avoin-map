'use client'

import { Box } from '@mui/material'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react' // note: 'overlayscrollbars-react'
// import styles from './Menu.module.css'

import ImgAccordion from '#/components/Sidebar/Main/Accordion/ImgAccordion'
import {
  ForestContent,
  BiodiversityContent,
  WetlandsContent,
  BuildingsContent,
  AirQualityContent,
  SnowCoverLossContent,
} from './Accordion'

export const MainMenu = () => {
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
        className="osLeft"
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
          title="Forest"
          img="/files/img/main-menu/main_menu_forests.jpg"
        >
          <ForestContent />
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
