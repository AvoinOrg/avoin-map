import type { CanvasFillImageId } from '#/common/types/map'
import { lineOptions } from 'maplibre_symbol_utils'

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
  16: 32,
  32: 32,
  64: 32,
  128: 32,
  256: 32,
  512: 32,
}

const lineWidthBySize: Record<CanvasFillSize, number> = {
  16: 1,
  32: 1,
  64: 1,
  128: 2,
  256: 3,
  512: 4,
}

const defaultLine = (
  type: string,
  size: CanvasFillSize,
  color: string
): lineOptions => ({
  color,
  width: lineWidthBySize[size],
  type,
  lineCap: 'butt', // avoids extra paint at segment ends
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
