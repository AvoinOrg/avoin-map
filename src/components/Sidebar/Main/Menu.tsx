'use client'

import React from 'react'

import ImgAccordion from '#/components/Sidebar/Main/Accordion/ImgAccordion'
import {
  ForestContent,
  BiodiversityContent,
  WetlandsContent,
  BuildingsContent,
  AirQualityContent,
  SnowCoverLossContent,
} from './Accordion'
import CustomAccordion from '#/components/common/CustomAccordion'
import SidebarContentBox from '../SidebarContentBox'
import { Box } from '@mui/material'
import { SCROLLBAR_WIDTH_REM } from '#/common/style/theme/constants'

const placeholderImage = 'path/to/placeholder/image.jpg'

export const MainMenu = () => {
  // const { isLoggedIn }: any = useContext(UserStateContext)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        flex: 1,
        scrollbarGutter: 'stable',
      }}
    >
      {/* {isLoggedIn &&
        privateDrawerItems.map((item, i) => (
          <ListItem key={item.title} sx={{fontFamily: theme.typography.fontFamily[0]}}>
            <Accordion drawerItem={true} item={item} />
          </ListItem>
        ))} */}
      <Box
        sx={{ backgroundColor: 'black', width: '100%', height: '200px' }}
      ></Box>
      <ImgAccordion title="Forest" img={placeholderImage}>
        <ForestContent />
      </ImgAccordion>
      <ImgAccordion title="Biodiversity" img={placeholderImage}>
        <BiodiversityContent />
      </ImgAccordion>
      <ImgAccordion title="Wetlands" img={placeholderImage}>
        <WetlandsContent />
      </ImgAccordion>
      <ImgAccordion title="Buildings" img={placeholderImage}>
        <BuildingsContent />
      </ImgAccordion>
      <ImgAccordion title="Air quality" img={placeholderImage}>
        <AirQualityContent />
      </ImgAccordion>
      <ImgAccordion title="Snow cover loss" img={placeholderImage}>
        <SnowCoverLossContent />
      </ImgAccordion>
    </Box>
  )
}

export default MainMenu
