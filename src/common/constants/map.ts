import type { CanvasFillImageId } from '#/common/types/map'
import { lineOptions } from 'maplibre_symbol_utils'

export const MAX_MERC_LAT = 85.05112878

export const FINLAND_BOUNDS = [31.6, 19.0, 70.1, 59.3]
export const MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT =
  'map-bottom-left-floating-controls'
export const MAP_CONTROL_EDGE_GUTTER_PX = 16
export const CARBON_HOME_FLOATING_GUTTER_PX = 10

export type CanvasFillOptions = {
  backGroundColor?: string

  size?: number
  factor?: number
  keepRepainting?: boolean
  lines: lineOptions[]
}

export const CANVAS_FILL_DEFAULT_COLOR = 'rgba(0,0,0,1)'
export const CANVAS_FILL_DEFAULT_BACKGROUND_COLOR = 'rgba(0,0,0,0)'

export const CANVAS_FILL_SIZES = [16, 32, 64, 128, 256, 512] as const
export type CanvasFillSize = (typeof CANVAS_FILL_SIZES)[number]

const baseCanvasFillOptions: Pick<
  CanvasFillOptions,
  'backGroundColor' | 'keepRepainting'
> = {
  backGroundColor: 'rgba(0,0,0,0)',
  keepRepainting: false,
}

const factorBySize: Record<CanvasFillSize, number> = {
  16: 16,
  32: 16,
  64: 16,
  128: 16,
  256: 16,
  512: 16,
}

const lineWidthBySize: Record<CanvasFillSize, number> = {
  16: 1,
  32: 1,
  64: 1,
  128: 1,
  256: 1,
  512: 1,
}

const defaultLine = (
  type: string,
  size: CanvasFillSize,
  color: string
): lineOptions => ({
  color,
  width: lineWidthBySize[size],
  type,
  // lineCap: 'butt', // avoids extra paint at segment ends
})

const lineTypeByImageId: Record<CanvasFillImageId, string> = {
  DiagonalCross: 'esriSFSDiagonalCross',
  Cross: 'esriSFSCross',
  ForwardDiagonal: 'esriSFSForwardDiagonal',
  BackwardDiagonal: 'esriSFSBackwardDiagonal',
  Vertical: 'esriSFSVertical',
  Horizontal: 'esriSFSHorizontal',
}

export const getCanvasFillPatternOptions = (
  canvasFillImageId: CanvasFillImageId,
  size: CanvasFillSize,
  color: string = CANVAS_FILL_DEFAULT_COLOR,
  backGroundColor: string = CANVAS_FILL_DEFAULT_BACKGROUND_COLOR
): CanvasFillOptions => ({
  ...baseCanvasFillOptions,
  backGroundColor,
  size,
  factor: factorBySize[size],
  lines: [defaultLine(lineTypeByImageId[canvasFillImageId], size, color)],
})

export type CanvasFillZoomSizeRange = {
  minZoom: number
  maxZoom?: number
  size: CanvasFillSize
}

export const CANVAS_FILL_ZOOM_SIZE_RANGES: CanvasFillZoomSizeRange[] = [
  { minZoom: 0, maxZoom: 1, size: 512 },
  { minZoom: 2, maxZoom: 3, size: 256 },
  { minZoom: 4, maxZoom: 6, size: 128 },
  { minZoom: 7, maxZoom: 9, size: 64 },
  { minZoom: 10, size: 32 },
  { minZoom: 14, size: 16 },
]

export const PLACE_RANK_ZOOM_ANCHORS: Array<[number, number]> = [
  [0, 2.3],
  [2, 3.3],
  [3, 3.8],
  [4, 4.5], // continent-ish
  [5, 5.0],
  [6, 5.7],
  [7, 6.1],
  [8, 6.6], // country
  [9, 7.1],
  [10, 7.6], // large region
  [11, 8.0],
  [12, 8.5], // state/region
  [13, 9.0],
  [14, 9.6], // metro/county
  [15, 10.1],
  [16, 10.6], // city
  [17, 11.1],
  [18, 11.6], // large town
  [19, 12.2],
  [20, 12.8], // town
  [21, 13.4],
  [22, 14.0], // suburb/village
  [23, 14.4],
  [24, 14.8], // neighbourhood
  [25, 15.4],
  [26, 16.0], // street
  [27, 16.6],
  [28, 17.2], // POI/amenity
  [29, 17.6],
  [30, 18.0], // address/entrance
]
