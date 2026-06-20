import { Box } from '#/common/style/theme/system'
import { MapButtons } from './MapButtonGroups'
import { MapSearchBar } from './MapSearchBar'
import { useUIStore } from '#/common/store'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { selectActiveSidebarMode } from '#/common/utils/sidebarBoundaryRegistry'
import { MAP_BUTTON_SIZE } from './MapButton'
import { Slot } from '../context/slotsContext'

export const MapActionsWrapper = () => {
  const minMapWidth = useUIStore((state) => state.mapDims.min?.width)
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const activeSidebarMode = useUIStore((state) =>
    selectActiveSidebarMode(state.sidebarBoundaries)
  )
  const isMobile = useIsMobile('desktop')
  const isVertical = true

  const isSearchOpen = activeMapMenu === 'search'
  const hideForMainSidebarMobile =
    activeSidebarMode === 'home' && isMobile && isSidebarOpen

  if (hideForMainSidebarMobile) {
    return null
  }

  return (
    <Box
      className="map-actions-wrapper"
      data-testid="map-actions-wrapper"
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
      )}
    </Box>
  )
}
