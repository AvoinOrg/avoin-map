// A wrapper component to be used for each applet's layout.
// Right now this only ensures that correct MapContext is used
// for each applet. See MapStore for more details.

'use client'

import React, { useEffect, useRef } from 'react'
import { useTolgee } from '@tolgee/react'

import { useMapStore, useUIStore } from '#/common/store'
import { ListedLayerMenuItem, MapContext } from '#/common/types/map'
import { useExclusiveLayerGroups } from '#/common/hooks/map/useExclusiveLayerGroups'
import { defaultListedLayerGroups } from '../Map/layers/defaultListedLayerGroups'
import { FINLAND_BOUNDS } from '#/common/constants/map'
import { useNullableSidebarBoundaryContext } from '#/components/Sidebar/sidebarBoundaryContext'
import {
  IntoSidebarHeaderChildrenSlot,
  IntoSidebarHeaderSlot,
} from '#/components/Sidebar/sidebarSlots'
import { Box, toSxArray, type AppSxProps } from '#/common/style/theme'
import { getPublicAppletRouteSlug } from '#/common/routing/publicRoutes'

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
const toAppSxItemArray = (sx?: AppSxProps) => toSxArray(sx) as AppSxItem[]

type BaseAppletWrapperProps = {
  children: React.ReactNode
  mapContext: MapContext
  localizationNamespace?: string
  subPath?: string
  // defaultLanguage?: string
  isNavbarHidden?: boolean
  searchCountryCodes?: string[]
  disableDefaultFitbounds?: boolean
  defaultView?: {
    center: [number, number]
    zoom: number
    duration?: number
  }
  listedLayerGroups?: ListedLayerMenuItem[]
  sx?: AppSxProps
}

type AppletWrapperProps = BaseAppletWrapperProps &
  (
    | {
        sidebarHeaderElement?: React.ReactNode
        sidebarHeaderTitle?: never
        sidebarHeaderChildren?: never
        sidebarHeaderBackgroundImage?: never
      }
    | {
        sidebarHeaderElement?: never
        sidebarHeaderTitle?: string
        sidebarHeaderChildren?: React.ReactNode
        sidebarHeaderBackgroundImage?: string
      }
  )

const AppletWrapper = ({
  children,
  mapContext,
  localizationNamespace,
  subPath,
  // defaultLanguage,
  isNavbarHidden,
  searchCountryCodes,
  disableDefaultFitbounds = false,
  defaultView,
  listedLayerGroups,
  sidebarHeaderElement,
  sidebarHeaderTitle,
  sidebarHeaderChildren,
  sidebarHeaderBackgroundImage,
  sx,
}: AppletWrapperProps) => {
  const tolgee = useTolgee(['update'])
  const sidebarBoundaryContext = useNullableSidebarBoundaryContext()

  const setMapContext = useMapStore((state) => state.setMapContext)
  const stateMapContext = useMapStore((state) => state.mapContext)
  const fitBounds = useMapStore((state) => state.fitBounds)
  const easeTo = useMapStore((state) => state.easeTo)

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
  const setSidebarHeaderConfig = useUIStore(
    (state) => state.setSidebarHeaderConfig
  )

  const setListedLayerGroups = useMapStore(
    (state) => state.setListedLayerGroups
  )

  useEffect(() => {
    if (defaultView != null) {
      easeTo({
        options: {
          center: defaultView.center,
          zoom: defaultView.zoom,
          duration: defaultView.duration ?? 0,
        },
        autoRelocateOptions: {
          checkIfAutoRelocate: true,
          disableAutoRelocate: true,
        },
      })
      return
    }

    if (disableDefaultFitbounds) {
      return
    }

    fitBounds({
      bbox: FINLAND_BOUNDS,
      options: { duration: 200, lonExtra: 0.6 },
      autoRelocateOptions: {
        checkIfAutoRelocate: true,
        disableAutoRelocate: true,
      },
    })
  }, [defaultView, disableDefaultFitbounds, easeTo, fitBounds])

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
      // defaultLanguage != null && tolgee.changeLanguage(defaultLanguage)
    }
  }, [tolgee.isLoaded()])

  useEffect(() => {
    let appletPath = subPath
    if (subPath == null && mapContext != null) {
      appletPath = getPublicAppletRouteSlug(mapContext)
    }
    const path = window.location.pathname
    // Split the path into segments based on "/"
    const segments = path.split('/').filter(Boolean) // filter(Boolean) removes any empty strings from the array

    if (segments.length > 0 && appletPath && appletPath !== 'main') {
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

  // Update sidebar header title when it changes
  useEffect(() => {
    setSidebarHeaderConfig({
      title: sidebarHeaderTitle || 'avoin map',
      backgroundImage: sidebarHeaderBackgroundImage,
    })

    return () => {
      // Reset to default on unmount
      setSidebarHeaderConfig({ title: 'avoin map' })
    }
  }, [sidebarHeaderTitle, sidebarHeaderBackgroundImage, setSidebarHeaderConfig])

  const isTolgeeReady = () => {
    if (
      localizationNamespace != null &&
      !tolgee
        .getAllRecords()
        .some((item) => item!.namespace === localizationNamespace)
    ) {
      return false
    }

    return true
  }

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        },
        ...toAppSxItemArray(sx),
      ]}
      className={'applet-wrapper'}
    >
      {stateMapContext === mapContext && isTolgeeReady() && (
        <>
          {/* Portal custom header element if provided */}
          {sidebarHeaderElement && sidebarBoundaryContext != null && (
            <IntoSidebarHeaderSlot>
              {sidebarHeaderElement}
            </IntoSidebarHeaderSlot>
          )}

          {/* Portal header children to slot inside default SidebarHeader */}
          {sidebarHeaderChildren && sidebarBoundaryContext != null && (
            <IntoSidebarHeaderChildrenSlot>
              {sidebarHeaderChildren}
            </IntoSidebarHeaderChildrenSlot>
          )}

          {children}
        </>
      )}
    </Box>
  )
}

export default AppletWrapper
