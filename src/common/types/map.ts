import type { Feature, FeatureCollection } from 'geojson'
import type { ReactNode } from 'react'
import type {
  StyleSpecification,
  LayerSpecification,
  MapGeoJSONFeature,
  GeoJSONSource,
  Map,
  MapLayerEventType,
  MapLayerMouseEvent,
  MapLayerTouchEvent,
  SourceSpecification,
} from 'maplibre-gl'
import type MaplibreDraw from 'maplibre-gl-draw'

import type { Actions as MapStoreActions } from '#/common/store/mapStore'
// interface mapFunctions {}

export type PopupProps = {
  onClose: () => {}
  features: PopupFeature[]
  isOpen?: boolean
}

export type Popup = (props: PopupProps) => ReactNode

export type AdditionalSelectionSource = {
  source: string
  sourceLayers?: string[]
}

export type SourceType = SourceSpecification['type']

export type LayerGroupOptions = {
  id: string
  mapContext: MapContext
  isHidden: boolean
  persist: boolean
  layers: LayerOptionsObj
  sources: SourceOptionsObj
  eventHandlers: LayerEventHandlerOptions[]
  handleDataUpdate?: (e: any) => void
}

export type LayerEventHandlers = Record<
  keyof MapLayerEventType,
  (e: any) => void
>

export type LayerOptions = {
  id: string
  source: string
  sourceLayer?: string
  name: string
  layerType: LayerType
  selectable: boolean
  multiSelectable: boolean
  hoverPointer: boolean
  popupOpts: PopupOpts | null
  useMb: boolean
  additionalSelectionSources?: AdditionalSelectionSource[]
}

export type LayerOptionsObj = {
  [key: string]: LayerOptions
}

export type SourceOptions = {
  id: string
  type: SourceType
  popupOpts: PopupOpts | null
  layerIds: string[]
}

export type SourceOptionsObj = {
  [key: string]: SourceOptions
}

export type LayerGroups = Record<string, LayerGroupOptions>

export interface LayerGroupDrawOptions {
  idField?: string
  polygonEnabled?: boolean
  editEnabled?: boolean
  deleteEnabled?: boolean
  featureAddMutator?: (feature: Feature) => Feature
  featureUpdateMutator?: (feature: Feature) => Feature
}

export interface MapDrawOptions extends LayerGroupDrawOptions {
  layerGroupId: string | null
  draw: MaplibreDraw | null
  isEnabled: boolean
  originalStyles?: Record<string, any>
  handleDrawCreate?: (e: any) => void
  handleDrawUpdate?: (e: any) => void
  handleDrawDelete?: (e: any) => void
  handleSelectionChange?: (e: any) => void
}

interface BaseLayerGroupAddOptions {
  mapContext?: MapContext
  layerConf?: SerializableLayerConf | LayerConf
  isAddedBefore?: boolean
  neighboringLayerGroupId?: LayerGroupId | string
  isHidden?: boolean
  persist?: boolean
  drawOptions?: LayerGroupDrawOptions
  zoomToExtent?: boolean
}

export type DataUpdateMutator = (data: FeatureCollection) => Promise<void>

// Compatible with hydration.
export interface SerializableLayerGroupAddOptions
  extends BaseLayerGroupAddOptions {
  layerConf?: SerializableLayerConf
  dataUpdateMutator?: DataUpdateMutator
}

// Not compatible with hydration. Includes a possible popup function within layerConf.
// TODO: Make layerConf required. Currently, it is optional because layerConf can be
// imported by mapStore directly, which is not clean.
export interface LayerGroupAddOptions extends BaseLayerGroupAddOptions {
  layerConf?: LayerConf
  persist?: false
}

export interface LayerGroupAddOptionsWithConf extends LayerGroupAddOptions {
  mapContext: MapContext
  layerConf: LayerConf | SerializableLayerConf
}

// TODO: Remove this enforced id names and the list of layerGroupConf imports.
// Make functions submit their own layerGroupConfs.
export type LayerGroupId =
  | 'building_energy_certs'
  | 'no2'
  | 'snow_cover_loss'
  | 'fi_buildings'
  | 'helsinki_buildings'
  | 'hsy_solarpotential'
  | 'fi_bogs'
  | 'cifor_peatdepth'
  | 'cifor_wetlands'
  | 'metsaan_ete_basic'
  | 'metsaan_ete_important'
  | 'zonation'
  | 'natura2000'
  | 'hansen'
  | 'fi_mature_forests'
  | 'mangrove_forests'
  | 'gfw_tree_plantations'
  | 'fi_forests'
  | 'terramonitor'

export type ExtendedLayerSpecification = LayerSpecification & {
  source: string
  sourceLayer?: string
  selectable?: boolean // whether a feature can be highlighted
  multiSelectable?: boolean // whether multiple features can be highlighted
  hoverPointer?: boolean // whether the pointer should change to a pointer when hovering over the layer
  additionalSelectionSources?: AdditionalSelectionSource[]
}

export type ExtendedSourceSpecification = SourceSpecification & {
  extendedOpts?: {
    ensureLocalData?: boolean
  }
}

export type ExtendedStyleSpecification = StyleSpecification & {
  sources: Record<string, ExtendedSourceSpecification>
  layers: ExtendedLayerSpecification[]
}

export type ExtendedStyleSpecificationOrFn =
  | ExtendedStyleSpecification
  | (() => Promise<ExtendedStyleSpecification>)

export type LayerEventHandlerOptions = {
  eventType: keyof MapLayerEventType
  layers: string[]
  handler: (e: MapLayerMouseEvent | MapLayerTouchEvent) => void
}

export type LayerEventHandlerAddOptions = {
  eventType: keyof MapLayerEventType
  layers: string[]
  handlerCreator: (
    map: Map
  ) => (e: MapLayerMouseEvent | MapLayerTouchEvent) => void
}
// TODO: Rename all these from layerConf to layerGroupConf
type BaseLayerConf = {
  id: string
  style: ExtendedStyleSpecificationOrFn
  useMb?: boolean
  eventHandlers?: LayerEventHandlerAddOptions[]
}

// SerializableLayerConf is used for hydration.
export interface SerializableLayerConf extends BaseLayerConf {
  style: ExtendedStyleSpecification
}

export interface LayerConf extends BaseLayerConf {
  popupOpts?: PopupOpts
}

export interface EventHandlerInitializer {
  eventType: keyof MapLayerEventType
}

// For checking if layer name adheres to LayerType, in runtime
export const layerTypes: readonly string[] = [
  'fill',
  'highlighted',
  'outline',
  'symbol',
  'raster',
]

export type LayerType = (typeof layerTypes)[number] | 'invalid'

export type OverlayMessage = {
  message: string | null
  layerGroupId: LayerGroupId
}

export type MapLibraryMode = 'hybrid' | 'maplibre'

// Queue priority is used to determine the order in which functions are executed.
// Low priority functions, such as layer styling, might depend on high priority functions.
export enum QueuePriority {
  LOW = 1, // layer styling, other stuff that can wait
  MEDIUM = 2,
  MEDIUM_HIGH = 3, // adding layers
  HIGH = 4, // for hydration and other vital stuff
}

export interface PopupData {
  features: MapGeoJSONFeature[]
  component: Popup
  source: string
  sourceLayer?: string
  multiPoppable?: boolean
  sidebar?: boolean
}

export interface PopupOpts {
  component: Popup
  source: string
  sourceLayer?: string
  multiPoppable?: boolean
  sidebar?: boolean
}

export type PopupFeature = {
  properties: any
}

export interface ILayerOption {
  serverId: string
  minzoom: number
  maxzoom?: number
  layerMinzoom?: number | null
  layerMaxzoom?: number | null
}

export type QueueOptions = {
  skipQueue?: boolean
  priority?: QueuePriority
}

export type QueueFunctionFuncName = keyof MapStoreActions

export type QueueFunction = {
  fn: (...args: any) => Promise<void>
  args: any[]
  priority?: QueuePriority
}

export type FunctionQueue = (QueueFunction & {
  promise: { resolve: any; reject: any }
})[]

export type MapContext = 'main' | 'any' | string | null

export const isGeoJSONSource = (source: any): source is GeoJSONSource => {
  return source != null && 'setData' in source // or other appropriate conditions
}

export type DrawMode = 'polygon' | 'edit'

export type FitBoundsOptions = {
  duration?: number
  lonExtra?: number
  latExtra?: number
}

export type ImageOptions = {
  id: string
  layerGroupId: string
  colorCode?: string
  size?: number
}

export type ExtendedMapGeoJSONFeature = MapGeoJSONFeature & {
  isAdditional?: boolean
  isPlaceholder?: boolean
}
