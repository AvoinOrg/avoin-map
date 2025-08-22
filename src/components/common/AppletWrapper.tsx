// A wrapper component to be used for each applet's layout.
// Right now this only ensures that correct MapContext is used
// for each applet. See MapStore for more details.

'use client'

import React, { useEffect, useRef } from 'react'
import { useMapStore, useUIStore } from '#/common/store'
import { ListedLayerGroup, MapContext } from '#/common/types/map'
import { useTolgee } from '@tolgee/react'
import { Box } from '@mui/material'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'
import { defaultListedLayerGroups } from '../Map/layers/defaultListedLayerGroups'

const AppletWrapper = ({
  children,
  mapContext,
  localizationNamespace,
  subPath,
  defaultLanguage,
  isNavbarHidden,
  searchCountryCodes,
  listedLayerGroups,
  sx,
}: {
  children: React.ReactNode
  mapContext: MapContext
  localizationNamespace?: string
  subPath?: string
  defaultLanguage?: string
  isNavbarHidden?: boolean
  searchCountryCodes?: string[]
  listedLayerGroups?: ListedLayerGroup[]
  sx?: any
}) => {
  const tolgee = useTolgee(['update'])

  const setMapContext = useMapStore((state) => state.setMapContext)
  const stateMapContext = useMapStore((state) => state.mapContext)
  useExclusiveLayerGroups()
  const storeSearchCountryCodes = useUIStore(
    (state) => state.searchCountryCodes
  )
  const setStoreSearchCountryCodes = useUIStore(
    (state) => state.setSearchCountryCodes
  )
  const originalCountryCodes = useRef<string[] | null>(null)

  const setIsBaseDomainForApplet = useUIStore(
    (state) => state.setIsBaseDomainForApplet
  )
  const setIsNavbarHidden = useUIStore((state) => state.setIsNavbarHidden)

  const setListedLayerGroups = useMapStore(
    (state) => state.setListedLayerGroups
  )

  useEffect(() => {
    if (listedLayerGroups == null) {
      setListedLayerGroups(defaultListedLayerGroups)
    } else {
      setListedLayerGroups(listedLayerGroups)
    }
  }, [listedLayerGroups])

  useEffect(() => {
    if (tolgee.isLoaded()) {
      localizationNamespace != null && tolgee.addActiveNs(localizationNamespace)
      defaultLanguage != null && tolgee.changeLanguage(defaultLanguage)
    }
  }, [tolgee.isLoaded()])

  useEffect(() => {
    let appletPath = subPath
    if (subPath == null && mapContext != null) {
      appletPath = mapContext
    }
    const path = window.location.pathname
    // Split the path into segments based on "/"
    const segments = path.split('/').filter(Boolean) // filter(Boolean) removes any empty strings from the array

    if (segments.length > 1) {
      setIsBaseDomainForApplet(segments[1] !== appletPath)
    }

    if (searchCountryCodes != null) {
      originalCountryCodes.current = storeSearchCountryCodes
      setStoreSearchCountryCodes(searchCountryCodes)
    } else if (originalCountryCodes.current == null) {
      originalCountryCodes.current = storeSearchCountryCodes
    }

    setMapContext(mapContext)

    setIsNavbarHidden(isNavbarHidden || false)

    return () => {
      tolgee.removeActiveNs(localizationNamespace)
      setIsBaseDomainForApplet(false)
      setIsNavbarHidden(false)
      if (originalCountryCodes.current != null) {
        setStoreSearchCountryCodes(originalCountryCodes.current)
      }
    }
  }, [])

  const isTolgeeReady = () => {
    if (
      localizationNamespace != null &&
      !tolgee
        .getAllRecords()
        .some((item) => item.namespace === localizationNamespace)
    ) {
      return false
    }

    return true
  }

  return (
    <Box sx={{ height: '100%', ...sx }} className={'applet-wrapper'}>
      {stateMapContext === mapContext && isTolgeeReady() && children}
    </Box>
  )
}

export default AppletWrapper
