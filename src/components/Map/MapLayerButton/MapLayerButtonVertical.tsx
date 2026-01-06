'use client'

import React, { useCallback, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'

import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import MapLayerButtonBase, { MapLayerButtonProps } from './MapLayerButtonBase'

const MapLayerButtonVertical = ({
  shownLayerLevels,
  mapMenuState,
  tooltipLabel,
  headerLabel,
  icon,
}: MapLayerButtonProps) => {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const verticalMenuWidth = '20rem'
  const verticalTopOffset = parseFloat(theme.spacing(2))
  const headerHeight = theme.spacing(5)

  const popperOffset = useMemo<[number, number]>(
    () => (isMobile ? [0, 0] : [0, 8]),
    [isMobile]
  )
  const popperPadding = isMobile ? 0 : 16

  const resolveAnchorEl = useCallback(
    (anchorRef: React.RefObject<HTMLButtonElement>) => ({
      getBoundingClientRect: () => {
        const anchorRect = anchorRef.current?.getBoundingClientRect()
        const left = isMobile ? 0 : anchorRect?.left ?? 0
        const top = isMobile ? 0 : verticalTopOffset

        return {
          width: 0,
          height: 0,
          top,
          bottom: top,
          left,
          right: left,
          x: left,
          y: top,
          toJSON: () => ({
            width: 0,
            height: 0,
            top,
            bottom: top,
            left,
            right: left,
            x: left,
            y: top,
          }),
        }
      },
    }),
    [isMobile, verticalTopOffset]
  )

  const paperSx = useMemo(
    () => ({
      maxWidth: isMobile ? '100vw' : `calc(100vw - 78px)`,
      maxHeight: isMobile ? '100vh' : `calc(100vh - 32px)`,
      height: isMobile ? '100vh' : 'auto',
      width: isMobile ? '100vw' : verticalMenuWidth,
      ...(isMobile && { borderRadius: 0 }),
    }),
    [isMobile, theme, verticalMenuWidth]
  )

  const placement = isMobile ? 'bottom-start' : 'left-start'
  const scrollMaxHeight = isMobile
    ? `calc(100vh - ${headerHeight})`
    : `calc(100vh - 32px - ${headerHeight})`

  return (
    <MapLayerButtonBase
      isVertical
      shownLayerLevels={shownLayerLevels}
      mapMenuState={mapMenuState}
      tooltipLabel={tooltipLabel}
      headerLabel={headerLabel}
      icon={icon}
      placement={placement}
      popperOffset={popperOffset}
      popperPadding={popperPadding}
      resolveAnchorEl={resolveAnchorEl}
      paperSx={paperSx}
      scrollMaxHeight={scrollMaxHeight}
    />
  )
}

export default MapLayerButtonVertical
