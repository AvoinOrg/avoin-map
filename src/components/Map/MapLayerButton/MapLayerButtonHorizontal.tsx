'use client'

import React, { useCallback, useMemo } from 'react'
import MapLayerButtonBase, { MapLayerButtonProps } from './MapLayerButtonBase'

const MapLayerButtonHorizontal = ({
  shownLayerLevels,
  mapMenuState,
  tooltipLabel,
  headerLabel,
  icon,
}: MapLayerButtonProps) => {
  const menuWidth = '12rem'
  const popperOffset = useMemo<[number, number]>(() => [0, 8], [])
  const popperPadding = 16
  const resolveAnchorEl = useCallback(
    (anchorRef: React.RefObject<HTMLButtonElement>) => anchorRef.current,
    []
  )

  return (
    <MapLayerButtonBase
      isVertical={false}
      shownLayerLevels={shownLayerLevels}
      mapMenuState={mapMenuState}
      tooltipLabel={tooltipLabel}
      headerLabel={headerLabel}
      icon={icon}
      placement="bottom-start"
      popperOffset={popperOffset}
      popperPadding={popperPadding}
      resolveAnchorEl={resolveAnchorEl}
      paperSx={{
        width: menuWidth,
        maxWidth: `calc(100vw - 78px)`,
        maxHeight: 'calc(100vh - 78px)',
      }}
    />
  )
}

export default MapLayerButtonHorizontal
