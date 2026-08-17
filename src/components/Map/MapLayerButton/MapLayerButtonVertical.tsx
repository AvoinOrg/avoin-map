import React, { useCallback, useMemo } from 'react'

import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import MapLayerButtonBase, {
  type MapLayerButtonMenuZIndex,
  type MapLayerButtonProps,
} from './MapLayerButtonBase'

const LAYER_MENU_HEADER_HEIGHT = '2.5rem'
const VERTICAL_MENU_TOP_OFFSET = 16

const MapLayerButtonVertical = ({
  shownLayerLevels,
  mapMenuState,
  tooltipLabel,
  headerLabel,
  icon,
}: MapLayerButtonProps) => {
  const isMobile = useIsMobile()
  const verticalMenuWidth = '26rem'

  const popperOffset = useMemo<[number, number]>(
    () => (isMobile ? [0, 0] : [0, 8]),
    [isMobile]
  )
  const popperPadding = isMobile ? 0 : 16

  const resolveAnchorEl = useCallback(
    (anchorRef: React.RefObject<HTMLButtonElement | null>) => ({
      getBoundingClientRect: () => {
        const anchorRect = anchorRef.current?.getBoundingClientRect()
        const left = isMobile ? 0 : anchorRect?.left ?? 0
        const top = isMobile ? 0 : VERTICAL_MENU_TOP_OFFSET

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
    [isMobile]
  )

  const paperSx = useMemo(
    () => ({
      maxWidth: isMobile ? '100vw' : `calc(100vw - 78px)`,
      maxHeight: isMobile ? '100vh' : `calc(100vh - 32px)`,
      height: isMobile ? '100vh' : 'auto',
      width: isMobile ? '100vw' : verticalMenuWidth,
      minWidth: isMobile ? '100vw' : verticalMenuWidth,
      ...(isMobile && { borderRadius: 0 }),
    }),
    [isMobile, verticalMenuWidth]
  )
  const menuZIndex = useMemo<MapLayerButtonMenuZIndex | undefined>(
    () =>
      isMobile
        ? (theme) => theme.zIndex.drawer + 20
        : undefined,
    [isMobile]
  )

  const placement = isMobile ? 'bottom-start' : 'left-start'
  const scrollMaxHeight = isMobile
    ? `calc(100vh - ${LAYER_MENU_HEADER_HEIGHT})`
    : `calc(100vh - 32px - ${LAYER_MENU_HEADER_HEIGHT})`

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
      menuZIndex={menuZIndex}
      scrollMaxHeight={scrollMaxHeight}
    />
  )
}

export default MapLayerButtonVertical
