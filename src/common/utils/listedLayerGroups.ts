import { LayerOrderLevel } from '#/common/types/map'
import type {
  ListedLayerAccordionItem,
  ListedLayerBackedMenuItem,
  ListedLayerGroup,
  ListedLayerMenuItem,
} from '#/common/types/map'

export const isListedLayerAccordionItem = (
  item: ListedLayerMenuItem
): item is ListedLayerAccordionItem => {
  return 'type' in item && item.type === 'accordion'
}

export const isListedLayerGroup = (
  item: ListedLayerMenuItem
): item is ListedLayerGroup => {
  return !isListedLayerAccordionItem(item)
}

export const isLayerBackedListedLayerItem = (
  item: ListedLayerMenuItem
): item is ListedLayerBackedMenuItem => {
  return 'addOptions' in item && item.addOptions != null
}

export const getListedLayerMenuOrderLevel = (
  item: ListedLayerMenuItem
): LayerOrderLevel => {
  if (isListedLayerAccordionItem(item)) {
    return item.menuOrderLevel
  }

  return item.addOptions.layerOrderOptions.layerOrderLevel
}

export const hasListedLayerMenuOrderLevel = (
  item: ListedLayerMenuItem,
  layerOrderLevel: LayerOrderLevel
): boolean => {
  return getListedLayerMenuOrderLevel(item) === layerOrderLevel
}

export const flattenLayerBackedListedLayerItems = (
  items: ListedLayerMenuItem[]
): ListedLayerBackedMenuItem[] => {
  return items.flatMap((item) => {
    const nestedItems = isListedLayerAccordionItem(item)
      ? flattenLayerBackedListedLayerItems(item.items ?? [])
      : []

    if (isLayerBackedListedLayerItem(item)) {
      return [item, ...nestedItems]
    }

    return nestedItems
  })
}
