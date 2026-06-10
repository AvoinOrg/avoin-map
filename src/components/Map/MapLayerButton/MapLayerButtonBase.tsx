import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslate } from '@tolgee/react'

import { useMapStore, useUIStore } from '#/common/store'
import type { PandaStyleProp } from '#/common/style/panda'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import {
  getListedLayerMenuOrderLevel,
  isListedLayerGroup,
} from '#/common/utils/listedLayerGroups'
import { MapMenuState } from '#/common/types/state'
import { Layers } from '#/components/icons'
import { MapButton } from '../MapButton'
import MapFloatingPanel, {
  type MapFloatingResolvedAnchor,
  type MapFloatingPlacement,
} from '../MapFloatingPanel'
import LayerMenuContent from './LayerMenuContent'

type Props = {
  isVertical: boolean
  shownLayerLevels: LayerOrderLevel[]
  mapMenuState: MapMenuState
  tooltipLabel: string
  headerLabel?: string
  icon?: React.ReactNode
  placement: MapFloatingPlacement
  popperOffset: [number, number]
  popperPadding: number
  resolveAnchorEl: (
    anchorRef: React.RefObject<HTMLButtonElement | null>
  ) => MapFloatingResolvedAnchor
  paperSx?: PandaStyleProp
  listSx?: PandaStyleProp
  scrollMaxHeight?: string
}

export type MapLayerButtonProps = {
  shownLayerLevels: LayerOrderLevel[]
  mapMenuState: MapMenuState
  tooltipLabel: string
  headerLabel?: string
  icon?: ReactNode
}

const MapLayerButtonBase = ({
  isVertical,
  shownLayerLevels,
  mapMenuState,
  tooltipLabel,
  headerLabel,
  icon,
  placement,
  popperOffset,
  popperPadding,
  resolveAnchorEl,
  paperSx,
  listSx,
  scrollMaxHeight,
}: Props) => {
  const listedLayerGroups = useMapStore((state) => state.listedLayerGroups)
  const toggleLayerGroup = useMapStore((state) => state.toggleLayerGroup)
  const setLayerGroupOpacity = useMapStore(
    (state) => state.setLayerGroupOpacity
  )
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)
  const setMapMenuState = useUIStore((state) => state.setMapMenuState)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [, requestPositionUpdate] = useState(0)
  const { t } = useTranslate('avoin-map')
  const opacityLabel = t('map.menus.layer_opacity')

  const isActive = useMemo(() => {
    return activeMapMenu === mapMenuState
  }, [activeMapMenu, mapMenuState])

  const filteredLayerGroups = useMemo(() => {
    return listedLayerGroups.filter((layerGroup) =>
      shownLayerLevels.includes(getListedLayerMenuOrderLevel(layerGroup))
    )
  }, [listedLayerGroups, shownLayerLevels])

  const handleOpacityChange = useCallback(
    (layerGroupId: string, nextOpacity: number) => {
      void setLayerGroupOpacity(layerGroupId, nextOpacity, { skipQueue: true })
    },
    [setLayerGroupOpacity]
  )

  const handleToggle = () => {
    setMapMenuState(mapMenuState, !isActive)
  }

  const handlePopperUpdate = useCallback(() => {
    requestPositionUpdate((current) => current + 1)
  }, [])

  const getAnchor = useCallback(
    () => resolveAnchorEl(anchorRef),
    [resolveAnchorEl]
  )

  const handleCloseMenu = () => {
    setMapMenuState(mapMenuState, false)
  }

  return (
    <>
      <MapButton
        onClick={handleToggle}
        ref={anchorRef}
        size="small"
        tooltip={tooltipLabel}
        isVertical={isVertical}
        styleProps={{
          backgroundColor: isActive ? 'neutral.main' : 'neutral.light',
        }}
      >
        {icon || <Layers />}
      </MapButton>
      <MapFloatingPanel
        open={isActive}
        anchor={getAnchor}
        placement={placement}
        offset={popperOffset}
        collisionPadding={popperPadding}
        onClose={handleCloseMenu}
        positionerSx={{ zIndex: 'calc(var(--z-index-drawer) + 3)' }}
        paperSx={[
          {
            maxWidth: 'calc(100vw - 78px)',
            maxHeight: isVertical
              ? 'calc(100vh - 32px)'
              : 'calc(100vh - 78px)',
            overflow: 'hidden',
            p: 0,
            backgroundColor: isVertical
              ? 'neutral.light'
              : 'rgba(246, 244, 244, 0.9)',
            borderRadius: '0.3125rem',
            display: 'flex',
            flexDirection: 'column',
            width: 'fit-content',
          },
          ...(Array.isArray(paperSx) ? paperSx : [paperSx]),
        ]}
      >
        <LayerMenuContent
          headerLabel={headerLabel}
          items={filteredLayerGroups}
          visibleLayerGroupIds={visibleLayerGroupIds}
          opacityLabel={opacityLabel}
          onOpacityChange={handleOpacityChange}
          onToggleLayer={(layerGroup: ListedLayerGroup) => {
            if (isListedLayerGroup(layerGroup)) {
              toggleLayerGroup(layerGroup.id, layerGroup.addOptions)
            }
          }}
          onInfoToggle={handlePopperUpdate}
          onClose={handleCloseMenu}
          listSx={listSx}
          scrollMaxHeight={scrollMaxHeight}
        />
      </MapFloatingPanel>
    </>
  )
}

export default MapLayerButtonBase
