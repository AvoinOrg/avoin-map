import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css } from 'styled-system/css'
import { useTranslate } from '@tolgee/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'
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
  listSx?: PandaStyleProp
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
  layerGroupSegmentSx?: PandaStyleProp
}

const LAYER_GROUP_SEGMENT_SX: PandaStyleProp = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '1.5rem',
  width: '100%',
  px: 3,
  py: 4,
}

const NESTED_LAYER_GROUP_SEGMENT_SX: PandaStyleProp = {
  ...LAYER_GROUP_SEGMENT_SX,
  px: 0,
  py: 0,
}

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
          <Box component="h2" sx={{ m: 0, textStyle: 'h3', textAlign: 'left' }}>
            {headerLabel}
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
        <BaseButton
          type="button"
          aria-label={t('map.buttons.menu.close')}
          onClick={onClose}
          className={css({
            p: 0.5,
            mr: 0,
            width: 32,
            height: 32,
            border: 0,
            borderRadius: '0.3125rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: 'neutral.darker',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'neutral.main',
            },
            '&:focus-visible': {
              outline: '2px solid var(--colors-secondary-dark)',
              outlineOffset: '2px',
            },
          })}
        >
          <Cross sx={{ width: 18, height: 18 }} />
        </BaseButton>
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
