// A wrapper component to be used for each applet's layout.
// Right now this only ensures that correct MapContext is used
// for each applet. See MapStore for more details.

'use client'

import React, { useEffect, useLayoutEffect } from 'react'
import { useMapStore, useUIStore } from '#/common/store'
import { MapContext } from '#/common/types/map'
import { useTolgee } from '@tolgee/react'
import { Box } from '@mui/material'

const AppletWrapper = ({
  children,
  mapContext,
  localizationNamespace,
  subPath,
  defaultLanguage,
  SidebarHeaderElement,
  sx,
}: {
  children: React.ReactNode
  mapContext: MapContext
  localizationNamespace?: string
  subPath?: string
  defaultLanguage?: string
  SidebarHeaderElement?: React.JSX.Element
  sx?: any
}) => {
  const tolgee = useTolgee(['update'])

  const setMapContext = useMapStore((state) => state.setMapContext)
  const stateMapContext = useMapStore((state) => state.mapContext)
  const setSidebarHeaderElement = useUIStore(
    (state) => state.setSidebarHeaderElement
  )
  const setIsBaseDomainForApplet = useUIStore(
    (state) => state.setIsBaseDomainForApplet
  )

  useEffect(() => {
    if (tolgee.isLoaded()) {
      localizationNamespace != null && tolgee.addActiveNs(localizationNamespace)
      defaultLanguage != null && tolgee.changeLanguage(defaultLanguage)
    }
  }, [tolgee.isLoaded()])

  useLayoutEffect(() => {
    if (SidebarHeaderElement != null && setSidebarHeaderElement != null) {
      const AdjustedSidebarHeaderElement = React.cloneElement(
        SidebarHeaderElement,
        {
          sx: {
            ...SidebarHeaderElement.props.sx,
            width: sx?.width ? sx.width : '100%',
          },
        }
      )

      setSidebarHeaderElement(AdjustedSidebarHeaderElement)
    }
  }, [setSidebarHeaderElement, SidebarHeaderElement])

  useEffect(() => {
    let appletPath = subPath
    if (subPath == null && mapContext != null) {
      appletPath = mapContext
    }
    const path = window.location.pathname
    // Split the path into segments based on "/"
    const segments = path.split('/').filter(Boolean) // filter(Boolean) removes any empty strings from the array
    setIsBaseDomainForApplet(segments[0] !== appletPath)

    setMapContext(mapContext)

    return () => {
      tolgee.removeActiveNs(localizationNamespace)
      setIsBaseDomainForApplet(false)
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
