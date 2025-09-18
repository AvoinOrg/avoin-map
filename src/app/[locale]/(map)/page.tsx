/** @jsxImportSource @emotion/react */
'use client'

import { useMapStore } from '#/common/store'
import AppletWrapper from '#/components/common/AppletWrapper'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'
import { MainMenu, Sidebar } from '#/components/Sidebar'
import { useEffect } from 'react'

const Page = () => {
  return (
    <AppletWrapper
      mapContext={'main'}
      localizationNamespace={'avoin-map'}
      isNavbarHidden={true}
      listedLayerGroups={defaultListedLayerGroups}
      sx={{
        pt: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Sidebar>
        <MainMenu />
      </Sidebar>
    </AppletWrapper>
  )
}

export default Page
