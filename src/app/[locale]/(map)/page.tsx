/** @jsxImportSource @emotion/react */
'use client'

import AppletWrapper from '#/components/common/AppletWrapper'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'
import { MainMenu } from '#/components/Sidebar'

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
      <MainMenu />
    </AppletWrapper>
  )
}

export default Page
