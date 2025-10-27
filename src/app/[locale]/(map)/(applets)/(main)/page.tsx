/** @jsxImportSource @emotion/react */
'use client'

import AppletWrapper from '#/components/common/AppletWrapper'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'

import { Menu } from './components/Menu'

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
      <Menu />
    </AppletWrapper>
  )
}

export default Page
