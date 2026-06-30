import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { Popover } from '@base-ui/react/popover'
import { useTranslate } from '@tolgee/react'

import { useMapStore, useUIStore } from '#/common/store'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import {
  getListedLayerMenuOrderLevel,
  isListedLayerGroup,
} from '#/common/utils/listedLayerGroups'
import { MapMenuState } from '#/common/types/state'
import { Layers } from '#/components/icons'
import { MapButton } from '../MapButton'
import {
  MapButtonMenuPlacement,
  MapButtonMenuPositioner,
  MapButtonMenuSurface,
  mapButtonMenuModal,
} from '../MapButtonMenu'
import LayerMenuContent from './LayerMenuContent'

type ResolvedAnchorEl =
  | Element
  | {
      getBoundingClientRect: () => DOMRect
    }
  | null
type PositionAnchorResolver = () => ResolvedAnchorEl
type TriggerRenderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> & {
  ref?: React.Ref<HTMLButtonElement>
  onClick?: React.MouseEventHandler<HTMLElement>
  color?: string
}

type Props = {
  isVertical: boolean
  shownLayerLevels: LayerOrderLevel[]
  mapMenuState: MapMenuState
  tooltipLabel: string
  headerLabel?: string
  icon?: React.ReactNode
  placement: MapButtonMenuPlacement
  popperOffset: [number, number]
  popperPadding: number
  resolveAnchorEl: (
    anchorRef: React.RefObject<HTMLButtonElement | null>
  ) => ResolvedAnchorEl
  paperSx?: React.ComponentProps<typeof MapButtonMenuSurface>['paperSx']
  listSx?: React.ComponentProps<typeof LayerMenuContent>['listSx']
  menuZIndex?: MapLayerButtonMenuZIndex
  scrollMaxHeight?: string
}

export type MapLayerButtonMenuZIndex = React.ComponentProps<
  typeof MapButtonMenuPositioner
>['zIndex']

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
  menuZIndex = (theme) => theme.zIndex.drawer + 3,
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

  const resolvePositionAnchor = useCallback<PositionAnchorResolver>(
    () => (isActive ? resolveAnchorEl(anchorRef) : null),
    [isActive, resolveAnchorEl]
  )

  const handleCloseMenu = () => {
    setMapMenuState(mapMenuState, false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setMapMenuState(mapMenuState, nextOpen)
  }

  return (
    <Popover.Root
      open={isActive}
      onOpenChange={handleOpenChange}
      modal={mapButtonMenuModal}
    >
      <Popover.Trigger
        key="map-layer-button-trigger"
        render={(triggerProps) => {
          const {
            color: ignoredColor,
            onClick: triggerOnClick,
            ref: triggerRef,
            ...resolvedTriggerProps
          } = triggerProps as TriggerRenderProps
          void ignoredColor

          return (
            <MapButton
              {...resolvedTriggerProps}
              onClick={(event) => {
                handleToggle()
                triggerOnClick?.(event)
              }}
              ref={(node) => {
                anchorRef.current = node
                if (typeof triggerRef === 'function') {
                  triggerRef(node)
                } else if (triggerRef) {
                  ;(
                    triggerRef as React.MutableRefObject<HTMLButtonElement | null>
                  ).current = node
                }
              }}
              size="small"
              tooltip={tooltipLabel}
              isVertical={isVertical}
              aria-haspopup="menu"
              aria-expanded={isActive ? 'true' : undefined}
              sx={{
                backgroundColor: isActive ? 'neutral.main' : 'neutral.light',
              }}
            >
              {icon || <Layers />}
            </MapButton>
          )
        }}
      />
      <MapButtonMenuPositioner
        key="map-layer-button-positioner"
        anchor={resolvePositionAnchor}
        isVertical={isVertical}
        placement={placement}
        alignOffset={popperOffset[0]}
        sideOffset={popperOffset[1]}
        collisionPadding={popperPadding}
        zIndex={menuZIndex}
      >
        <MapButtonMenuSurface
          isVertical={isVertical}
          paperSx={[
            {
              maxWidth: `calc(100vw - 78px)`,
              maxHeight: isVertical
                ? `calc(100vh - 32px)`
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
          initialFocus={false}
          finalFocus={false}
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
            onClose={handleCloseMenu}
            listSx={listSx}
            scrollMaxHeight={scrollMaxHeight}
          />
        </MapButtonMenuSurface>
      </MapButtonMenuPositioner>
    </Popover.Root>
  )
}

export default MapLayerButtonBase
