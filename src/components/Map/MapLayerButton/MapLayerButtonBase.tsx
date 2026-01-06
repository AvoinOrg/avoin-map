import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import { ClickAwayListener, Paper, Popper } from '@mui/material'
import type { Instance, Placement, VirtualElement } from '@popperjs/core'
import { alpha, SxProps, Theme } from '@mui/material/styles'
import { useTranslate } from '@tolgee/react'

import { useMapStore, useUIStore } from '#/common/store'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { LayerOrderLevel, ListedLayerGroup } from '#/common/types/map'
import { MapMenuState } from '#/common/types/state'
import { Layers } from '#/components/icons'
import { MapButton } from '../MapButton'
import LayerMenuContent from './LayerMenuContent'

type AnchorEl = HTMLElement | VirtualElement | null

type Props = {
  isVertical: boolean
  shownLayerLevels: LayerOrderLevel[]
  mapMenuState: MapMenuState
  tooltipLabel: string
  headerLabel?: string
  icon?: React.ReactNode
  placement: Placement
  popperOffset: [number, number]
  popperPadding: number
  resolveAnchorEl: (anchorRef: React.RefObject<HTMLButtonElement>) => AnchorEl
  paperSx?: SxProps<Theme>
  listSx?: SxProps<Theme>
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
  const popperRef = useRef<Instance | null>(null)
  const { t } = useTranslate('avoin-map')
  const opacityLabel = t('map.menus.layer_opacity')

  const isActive = useMemo(() => {
    return activeMapMenu === mapMenuState
  }, [activeMapMenu, mapMenuState])

  const filteredLayerGroups = useMemo(() => {
    return listedLayerGroups.filter((layerGroup) =>
      shownLayerLevels.includes(
        layerGroup.addOptions.layerOrderOptions.layerOrderLevel
      )
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
    popperRef.current?.update()
  }, [])

  const anchorEl = resolveAnchorEl(anchorRef)

  useEffect(() => {
    if (!isActive) {
      return
    }
    popperRef.current?.update()
  }, [
    isActive,
    anchorEl,
    placement,
    popperOffset[0],
    popperOffset[1],
    popperPadding,
  ])

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }
    setMapMenuState(mapMenuState, false)
  }

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
        sx={{
          backgroundColor: isActive ? 'neutral.main' : 'neutral.light',
        }}
      >
        {icon || <Layers />}
      </MapButton>
      <Popper
        open={isActive}
        anchorEl={anchorEl}
        popperRef={popperRef}
        placement={placement}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: popperOffset,
            },
          },
          {
            name: 'flip',
            enabled: false,
          },
          {
            name: 'preventOverflow',
            options: {
              padding: popperPadding,
              tether: true,
              altAxis: true,
            },
          },
        ]}
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 3,
        })}
      >
        <Paper
          sx={[
            (theme) => ({
              maxWidth: `calc(100vw - 78px)`,
              maxHeight: isVertical
                ? `calc(100vh - 32px)`
                : 'calc(100vh - 78px)',
              overflow: 'hidden',
              p: 0,
              backgroundColor: isVertical
                ? theme.palette.neutral.light
                : alpha(theme.palette.neutral.light, 0.9),
              borderRadius: '0.3125rem',
              display: 'flex',
              flexDirection: 'column',
              width: 'fit-content',
            }),
            ...(Array.isArray(paperSx) ? paperSx : [paperSx]),
          ]}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <LayerMenuContent
              headerLabel={headerLabel}
              items={filteredLayerGroups}
              visibleLayerGroupIds={visibleLayerGroupIds}
              opacityLabel={opacityLabel}
              onOpacityChange={handleOpacityChange}
              onToggleLayer={(layerGroup: ListedLayerGroup) => {
                toggleLayerGroup(layerGroup.id, layerGroup.addOptions)
              }}
              onInfoToggle={handlePopperUpdate}
              onClose={handleCloseMenu}
              listSx={listSx}
              scrollMaxHeight={scrollMaxHeight}
            />
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  )
}

export default MapLayerButtonBase
