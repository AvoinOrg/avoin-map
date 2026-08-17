import React from 'react'
import { useTranslate } from '@tolgee/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import { AppSxProps, Box, toSxArray } from '#/common/style/theme'
import { IconButton } from '#/components/common/Button'
import { Cross } from '#/components/icons'
import { ListedLayerGroup, ListedLayerMenuItem } from '#/common/types/map'
import {
  isListedLayerAccordionItem,
  isListedLayerGroup,
} from '#/common/utils/listedLayerGroups'
import LayerMenuAccordion from '#/components/common/LayerMenuAccordion'
import TText from '#/components/common/TText'
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
  listSx?: AppSxProps
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
  layerGroupSegmentSx?: AppSxProps
}

const LAYER_GROUP_SEGMENT_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '1.5rem',
  width: '100%',
  px: 3,
  py: 4,
} satisfies AppSxProps

const NESTED_LAYER_GROUP_SEGMENT_SX = {
  ...LAYER_GROUP_SEGMENT_SX,
  px: 0,
  py: 0,
} satisfies AppSxProps

const LAYER_MENU_HEADER_INSET = 3
const LAYER_MENU_CLOSE_BUTTON_SIZE = 32
const LAYER_MENU_CLOSE_GLYPH_SIZE = 18
// Move the hit surface out by the centered glyph's half-gap so the visible
// glyph, rather than the larger button surface, lands on the header inset.
const LAYER_MENU_CLOSE_BUTTON_EDGE_OFFSET =
  (LAYER_MENU_CLOSE_BUTTON_SIZE - LAYER_MENU_CLOSE_GLYPH_SIZE) / 2

const LayerMenuAccordionRow = ({
  item,
  children,
  onInfoToggle,
  showBottomSeparator,
}: {
  item: Extract<ListedLayerMenuItem, { type: 'accordion' }>
  children?: React.ReactNode
  onInfoToggle?: () => void
  showBottomSeparator: boolean
}) => {
  const { t } = useTranslate(item.translationNs)
  const ContentComponent = item.ContentComponent
  const ariaLabel = item.ariaLabelTranslationKey
    ? t(item.ariaLabelTranslationKey)
    : t(item.titleTranslationKey)

  return (
    <LayerMenuAccordion
      id={`layer-menu-accordion-${item.id}`}
      title={
        <TText keyName={item.titleTranslationKey} ns={item.translationNs} />
      }
      ariaLabel={ariaLabel}
      defaultExpanded={item.defaultExpanded}
      backgroundImageSrc={item.backgroundImageSrc}
      onTransitionEnd={onInfoToggle}
      showBottomSeparator={showBottomSeparator}
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
  layerGroupSegmentSx = LAYER_GROUP_SEGMENT_SX,
}: LayerMenuItemsProps) => {
  const renderedItems: React.ReactNode[] = []
  let layerGroupSegment: ListedLayerGroup[] = []

  const renderLayerItem = (item: ListedLayerGroup) => (
    <LayerItem
      key={item.id}
      layerGroup={item}
      isSelected={visibleLayerGroupIds.includes(item.id)}
      showOpacitySlider={item.styleOptions?.showOpacitySlider}
      opacityLabel={opacityLabel}
      onOpacityChange={onOpacityChange}
      onInfoToggle={onInfoToggle}
      onSelect={() => {
        onToggleLayer(item)
      }}
    />
  )

  const flushLayerGroupSegment = () => {
    if (layerGroupSegment.length === 0) {
      return
    }

    const segmentItems = layerGroupSegment
    const firstItem = segmentItems[0]
    const lastItem = segmentItems[segmentItems.length - 1]

    renderedItems.push(
      <Box
        key={`layer-group-segment-${firstItem.id}-${lastItem.id}`}
        sx={layerGroupSegmentSx}
      >
        {segmentItems.map(renderLayerItem)}
      </Box>
    )

    layerGroupSegment = []
  }

  items.forEach((item, index) => {
    if (isListedLayerGroup(item)) {
      layerGroupSegment.push(item)
      return
    }

    if (isListedLayerAccordionItem(item)) {
      flushLayerGroupSegment()

      renderedItems.push(
        <LayerMenuAccordionRow
          key={item.id}
          item={item}
          onInfoToggle={onInfoToggle}
          showBottomSeparator={index < items.length - 1}
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
                layerGroupSegmentSx={NESTED_LAYER_GROUP_SEGMENT_SX}
              />
            </Box>
          )}
        </LayerMenuAccordionRow>
      )
    }
  })

  flushLayerGroupSegment()

  return <>{renderedItems}</>
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
        data-slot="layer-menu-header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: LAYER_MENU_HEADER_INSET,
          py: 2,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
          backgroundColor: 'inherit',
          zIndex: 1,
        }}
      >
        {headerLabel ? (
          <Box
            component="h3"
            data-slot="layer-menu-title"
            sx={{ m: 0, typography: 'h3', textAlign: 'left' }}
          >
            {headerLabel}
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
        <IconButton
          size="small"
          data-slot="layer-menu-close-button"
          aria-label={t('map.buttons.menu.close', 'Close menu')}
          onClick={onClose}
          sx={{
            p: 0.5,
            mr: `-${LAYER_MENU_CLOSE_BUTTON_EDGE_OFFSET}px`,
            width: LAYER_MENU_CLOSE_BUTTON_SIZE,
            height: LAYER_MENU_CLOSE_BUTTON_SIZE,
          }}
        >
          <Cross
            data-slot="layer-menu-close-glyph"
            sx={{
              width: LAYER_MENU_CLOSE_GLYPH_SIZE,
              height: LAYER_MENU_CLOSE_GLYPH_SIZE,
            }}
          />
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
              width: '100%',
            },
            ...toSxArray(listSx),
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
