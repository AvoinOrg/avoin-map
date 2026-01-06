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
  const mobileInset = parseFloat(theme.spacing(1))

  const popperOffset = useMemo<[number, number]>(
    () => (isMobile ? [0, 0] : [0, 8]),
    [isMobile]
  )
  const popperPadding = isMobile ? mobileInset : 16

  const resolveAnchorEl = useCallback(
    (anchorRef: React.RefObject<HTMLButtonElement>) => ({
      getBoundingClientRect: () => {
        const anchorRect = anchorRef.current?.getBoundingClientRect()
        const left = isMobile ? mobileInset : anchorRect?.left ?? 0
        const top = isMobile ? mobileInset : verticalTopOffset

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
    [isMobile, mobileInset, verticalTopOffset]
  )

  const paperSx = useMemo(
    () => ({
      maxWidth: isMobile
        ? `calc(100vw - ${theme.spacing(2)})`
        : `calc(100vw - 78px)`,
      maxHeight: isMobile
        ? `calc(100vh - ${theme.spacing(2)})`
        : `calc(100vh - 32px)`,
      height: isMobile ? `calc(100vh - ${theme.spacing(2)})` : 'auto',
      width: isMobile ? `calc(100vw - ${theme.spacing(2)})` : verticalMenuWidth,
    }),
    [isMobile, theme, verticalMenuWidth]
  )

  const placement = isMobile ? 'bottom-start' : 'left-start'

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
    />
  )
}

export default MapLayerButtonVertical
