/** @jsxImportSource @emotion/react */
'use client'

import AppletWrapper from '#/components/common/AppletWrapper'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'
import { SidebarBoundary } from '#/components/Sidebar'

import MainSidebarContent from './components/MainSidebarContent'

const Page = () => {
  return (
    <SidebarBoundary id="main-home" mode="home">
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
        <MainSidebarContent />
      </AppletWrapper>
    </SidebarBoundary>
  )
}

export default Page
