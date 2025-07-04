import { Box } from '@mui/material'
import { MapButtons } from './MapButtons'
import { MapSearchBar } from './MapSearchBar'

export const MapActionsWrapper = () => {
  return (
    <Box
      sx={(theme) => ({
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing(1),
        alignItems: 'flex-start',
        zIndex:
          theme.zIndex.mobileStepper /* force this to be on top of the map */,
      })}
    >
      <MapSearchBar />
      <MapButtons />
    </Box>
  )
}
