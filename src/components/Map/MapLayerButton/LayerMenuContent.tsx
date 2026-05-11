import React from 'react'
import { Box, IconButton, SxProps, Theme, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import { Cross } from '#/components/icons'
import { ListedLayerGroup, ListedLayerMenuItem } from '#/common/types/map'
import {
  isListedLayerAccordionItem,
  isListedLayerGroup,
} from '#/common/utils/listedLayerGroups'
import LayerMenuAccordion from '#/components/common/LayerMenuAccordion'
import LayerItem from './LayerItem'

type Props = {
  headerLabel?: string
  items: ListedLayerMenuItem[]
  visibleLayerGroupIds: string[]
  opacityLabel: string
  onOpacityChange?: (layerGroupId: string, opacity: number) => void
  onToggleLayer: (layerGroup: ListedLayerGroup) => void
  onInfoToggle?: () => void
  onClose: () => void
  listSx?: SxProps<Theme>
  scrollMaxHeight?: string
}

type LayerMenuItemsProps = Pick<
  Props,
  | 'visibleLayerGroupIds'
  | 'opacityLabel'
  | 'onOpacityChange'
  | 'onToggleLayer'
  | 'onInfoToggle'
> & {
  items: ListedLayerMenuItem[]
}

const LayerMenuAccordionRow = ({
  item,
  children,
  onInfoToggle,
}: {
  item: Extract<ListedLayerMenuItem, { type: 'accordion' }>
  children?: React.ReactNode
  onInfoToggle?: () => void
}) => {
  const { t } = useTranslate(item.translationNs)
  const ContentComponent = item.ContentComponent
  const title = t(item.titleTranslationKey, item.title)
  const ariaLabel = item.ariaLabelTranslationKey
    ? t(item.ariaLabelTranslationKey, item.ariaLabel)
    : (item.ariaLabel ?? title)

  return (
    <LayerMenuAccordion
      id={`layer-menu-accordion-${item.id}`}
      title={title}
      ariaLabel={ariaLabel}
      defaultExpanded={item.defaultExpanded}
      backgroundImageSrc={item.backgroundImageSrc}
      onTransitionEnd={onInfoToggle}
    >
      {item.content}
      {ContentComponent && <ContentComponent />}
      {children}
    </LayerMenuAccordion>
  )
}

const LayerMenuItems = ({
  items,
  visibleLayerGroupIds,
  opacityLabel,
  onOpacityChange,
  onToggleLayer,
  onInfoToggle,
}: LayerMenuItemsProps) => {
  return (
    <>
      {items.map((item) => {
        if (isListedLayerGroup(item)) {
          return (
            <LayerItem
              key={item.id}
              layerGroup={item}
              isSelected={visibleLayerGroupIds.includes(item.id)}
              showOpacitySlider={item.styleOptions?.showOpacitySlider}
              opacityLabel={opacityLabel}
              onOpacityChange={onOpacityChange}
              onInfoToggle={onInfoToggle}
              onSelect={(_id) => {
                onToggleLayer(item)
              }}
            />
          )
        }

        if (isListedLayerAccordionItem(item)) {
          return (
            <LayerMenuAccordionRow
              key={item.id}
              item={item}
              onInfoToggle={onInfoToggle}
            >
              {item.items && item.items.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '1.5rem',
                    pt: '1.5rem',
                  }}
                >
                  <LayerMenuItems
                    items={item.items}
                    visibleLayerGroupIds={visibleLayerGroupIds}
                    opacityLabel={opacityLabel}
                    onOpacityChange={onOpacityChange}
                    onToggleLayer={onToggleLayer}
                    onInfoToggle={onInfoToggle}
                  />
                </Box>
              )}
            </LayerMenuAccordionRow>
          )
        }

        return null
      })}
    </>
  )
}

const LayerMenuContent = ({
  headerLabel,
  items,
  visibleLayerGroupIds,
  opacityLabel,
  onOpacityChange,
  onToggleLayer,
  onInfoToggle,
  onClose,
  listSx,
  scrollMaxHeight,
}: Props) => {
  const { t } = useTranslate('avoin-map')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 3,
          py: 2,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
          backgroundColor: 'inherit',
          zIndex: 1,
        }}
      >
        {headerLabel ? (
          <Typography variant="h3" sx={{ textAlign: 'left' }}>
            {headerLabel}
          </Typography>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
        <IconButton
          size="small"
          aria-label={t('map.buttons.menu.close', 'Close menu')}
          onClick={onClose}
          sx={{ p: 0.5, mr: 0, width: 32, height: 32 }}
        >
          <Cross sx={{ width: 18, height: 18 }} />
        </IconButton>
      </Box>
      <OverlayScrollbarsComponent
        className="osScroll"
        options={{
          overflow: { x: 'hidden', y: 'scroll' },
          scrollbars: {
            theme: 'os-theme-dark',
            autoHide: 'leave',
            autoHideDelay: 600,
          },
        }}
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          height: '100%',
          ...(scrollMaxHeight ? { maxHeight: scrollMaxHeight } : {}),
        }}
        defer
      >
        <Box
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '1.5rem',
              width: '100%',
              px: 3,
              py: 4,
            },
            ...(Array.isArray(listSx) ? listSx : [listSx]),
          ]}
        >
          <LayerMenuItems
            items={items}
            visibleLayerGroupIds={visibleLayerGroupIds}
            opacityLabel={opacityLabel}
            onOpacityChange={onOpacityChange}
            onToggleLayer={onToggleLayer}
            onInfoToggle={onInfoToggle}
          />
        </Box>
      </OverlayScrollbarsComponent>
    </Box>
  )
}

export default LayerMenuContent
