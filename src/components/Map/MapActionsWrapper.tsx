import { Box } from '@mui/material'
import { MapButtons } from './MapButtonGroups'
import { MapSearchBar } from './MapSearchBar'
import { useUIStore } from '#/common/store'

export const MapActionsWrapper = () => {
  const minMapWidth = useUIStore((state) => state.mapDims.min?.width)
  const isVertical = minMapWidth != null && minMapWidth < 500

  return (
    <Box
      className="map-actions-wrapper"
      sx={(theme) => ({
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: theme.spacing(1),
        alignItems: 'flex-end',
        flex: 1,
        zIndex:
          theme.zIndex.mapButtons /* force this to be on top of the map */,
      })}
    >
      <MapSearchBar isVertical={isVertical} />
      <MapButtons isVertical={isVertical} />
    </Box>
  )
}
