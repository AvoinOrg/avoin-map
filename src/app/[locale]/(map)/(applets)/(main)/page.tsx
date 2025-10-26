/** @jsxImportSource @emotion/react */
'use client'

import { useEffect } from 'react'

import { useMapStore } from '#/common/store'
import AppletWrapper from '#/components/common/AppletWrapper'
import { defaultListedLayerGroups } from '#/components/Map/layers/defaultListedLayerGroups'
import { FINLAND_BOUNDS } from '#/common/constants/map'

import { Menu } from './components/Menu'

const Page = () => {
  const fitBounds = useMapStore((state) => state.fitBounds)

  useEffect(() => {
    fitBounds({
      bbox: FINLAND_BOUNDS,
      options: { duration: 200, lonExtra: 1 },
      autoRelocateOptions: {
        checkIfAutoRelocate: true,
        disableAutoRelocate: true,
      },
    })
  }, [fitBounds])

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
