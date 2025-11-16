import { Box } from '@mui/material'
import { MapButtons } from './MapButtonGroups'
import { MapSearchBar } from './MapSearchBar'
import { useUIStore } from '#/common/store'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useElementSize } from '#/common/hooks/ui/useResizeObserver'
import { useDebounce } from '#/common/hooks/useDebounce'
import {
  MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH,
  MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH,
} from './MapSearchBar'
import { MAP_BUTTON_SIZE } from './MapButton'

const SIDE_MARGIN = 32

export const MapActionsWrapper = () => {
  const minMapWidth = useUIStore((state) => state.mapDims.min?.width)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { width: wrapperWidth, height: wrapperHeight } =
    useElementSize(wrapperRef)

  const [isVertical, setIsVertical] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth < 1100
  })

  const debouncedWrapperHeight = useDebounce(wrapperHeight, 250)
  const debouncedWrapperWidth = useDebounce(wrapperWidth, 250)

  const horizontalWidth = useMemo(() => {
    if (!debouncedWrapperHeight || !debouncedWrapperWidth) return undefined

    if (debouncedWrapperHeight && debouncedWrapperHeight > MAP_BUTTON_SIZE) {
      const width =
        debouncedWrapperHeight +
        MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH -
        MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH +
        SIDE_MARGIN
      return width
    } else {
      return (debouncedWrapperWidth || 0) + SIDE_MARGIN
    }
  }, [debouncedWrapperHeight, debouncedWrapperWidth])

  const debouncedHorizontalWidth = useDebounce(horizontalWidth, 250)

  // Debounce just the computed width to avoid rapid effect re-runs during layout settle
  // const debouncedHorizontalWidth = useDebounce(horizontalWidth, 250)

  useLayoutEffect(() => {
    if (minMapWidth && debouncedHorizontalWidth) {
      const nextIsVertical = debouncedHorizontalWidth > minMapWidth
      // Avoid unnecessary state updates (prevents extra renders)
      setIsVertical((prev) => (prev !== nextIsVertical ? nextIsVertical : prev))
    }
  }, [minMapWidth, debouncedHorizontalWidth])

  return (
    <Box
      ref={wrapperRef}
      className="map-actions-wrapper"
      sx={(theme) => ({
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: theme.spacing(1),
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex:
          theme.zIndex.mapButtons /* force this to be on top of the map */,
      })}
    >
      {minMapWidth != null && (
        <>
          <MapSearchBar isVertical={isVertical} />
          <MapButtons isVertical={isVertical} />
        </>
      )}
    </Box>
  )
}
