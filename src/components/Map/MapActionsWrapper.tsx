import { Box } from '@mui/material'
import { useParams, usePathname } from 'next/navigation'
import { MapButtons } from './MapButtonGroups'
import { MapSearchBar } from './MapSearchBar'
import { useUIStore } from '#/common/store'
import { useRef, useState } from 'react'
import { useElementSize } from '#/common/hooks/ui/useResizeObserver'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { getPathnameWithoutLocale } from '#/common/routing/routing'
import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
// import { useDebounce } from '#/common/hooks/useDebounce'
// import {
//   MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH,
//   MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH,
// } from './MapSearchBar'
import { MAP_BUTTON_SIZE } from './MapButton'
import { Slot } from '../context/slotsContext'

const SIDE_MARGIN = 32

export const MapActionsWrapper = () => {
  const minMapWidth = useUIStore((state) => state.mapDims.min?.width)
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isMobile = useIsMobile('desktop')
  const pathname = usePathname()
  const { locale } = useParams()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { width: wrapperWidth, height: wrapperHeight } =
    useElementSize(wrapperRef)

  const [isVertical, setIsVertical] = useState(() => {
    // if (typeof window === 'undefined') return true
    // return window.innerWidth < 1100
    return true
  })

  // const debouncedWrapperHeight = useDebounce(wrapperHeight, 250)
  // const debouncedWrapperWidth = useDebounce(wrapperWidth, 250)

  // const horizontalWidth = useMemo(() => {
  //   if (!debouncedWrapperHeight || !debouncedWrapperWidth) return undefined

  //   if (
  //     debouncedWrapperHeight &&
  //     debouncedWrapperWidth &&
  //     debouncedWrapperHeight > debouncedWrapperWidth
  //   ) {
  //     const width =
  //       debouncedWrapperHeight +
  //       MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH -
  //       MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH +
  //       SIDE_MARGIN
  //     return width
  //   } else {
  //     return (debouncedWrapperWidth || 0) + SIDE_MARGIN
  //   }
  // }, [debouncedWrapperHeight, debouncedWrapperWidth])

  // const debouncedHorizontalWidth = useDebounce(horizontalWidth, 250)

  // Debounce just the computed width to avoid rapid effect re-runs during layout settle
  // const debouncedHorizontalWidth = useDebounce(horizontalWidth, 250)

  // useLayoutEffect(() => {
  //   if (minMapWidth && debouncedHorizontalWidth) {
  //     const nextIsVertical = debouncedHorizontalWidth > minMapWidth
  //     // Avoid unnecessary state updates (prevents extra renders)
  //     setIsVertical((prev) => (prev !== nextIsVertical ? nextIsVertical : prev))
  //   }
  // }, [minMapWidth, debouncedHorizontalWidth])

  const isSearchOpen = activeMapMenu === 'search'
  const pathnameWithoutLocale = getPathnameWithoutLocale(
    pathname,
    locale ?? null
  )
  const hideForMainSidebarMobile =
    pathnameWithoutLocale === '/' && isMobile && isSidebarOpen

  if (hideForMainSidebarMobile) {
    return null
  }

  return (
    <Box
      ref={wrapperRef}
      className="map-actions-wrapper"
      sx={(theme) => ({
        position: 'absolute',
        top: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
        right: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex:
          theme.zIndex.mapButtons /* force this to be on top of the map */,
      })}
    >
      {minMapWidth != null && (
        <>
          {isVertical ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '0.5rem',
                  alignItems: 'flex-end',
                  pointerEvents: 'auto',
                }}
              >
                <MapSearchBar isVertical={isVertical} />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                  pointerEvents: 'auto',
                }}
              >
                <Box
                  sx={{
                    marginTop: isSearchOpen
                      ? 0
                      : `calc(-${MAP_BUTTON_SIZE}px - 0.5rem)`,
                  }}
                >
                  <Slot name="map-sticky-menu-toggle" />
                </Box>
                <MapButtons isVertical={isVertical} />
              </Box>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '0.5rem',
                  alignItems: 'flex-end',
                  pointerEvents: 'auto',
                }}
              >
                <MapSearchBar isVertical={isVertical} />
                <MapButtons isVertical={isVertical} />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  pointerEvents: 'auto',
                }}
              >
                <Slot name="map-sticky-menu-toggle" />
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  )
}
