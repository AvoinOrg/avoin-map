import { MOBILE_BREAKPOINT_PX } from '#/common/style/theme/constants'
import type { MapDims } from '#/common/types/mapDims'

const LOGIN_POPUP_WIDTH = 375
const LOGIN_POPUP_HEIGHT = 667

export type AuthPopupGeometryInput = {
  availHeight: number
  availLeft?: number
  availTop?: number
  availWidth: number
  innerHeight: number
  innerWidth: number
  outerHeight?: number
  outerWidth?: number
  screenX?: number
  screenY?: number
  visibleMap?: MapDims
}

export type AuthPopupGeometry = {
  height: number
  left: number
  top: number
  width: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max))

const toPositiveNumber = (value: number | undefined, fallback: number) =>
  Number.isFinite(value) && value != null && value > 0 ? value : fallback

const getViewportScreenOffset = ({
  innerHeight,
  innerWidth,
  outerHeight,
  outerWidth,
  screenX,
  screenY,
}: AuthPopupGeometryInput) => {
  const horizontalChrome = Math.max(0, (outerWidth ?? innerWidth) - innerWidth)
  const verticalChrome = Math.max(0, (outerHeight ?? innerHeight) - innerHeight)

  return {
    left: (screenX ?? 0) + horizontalChrome / 2,
    top: (screenY ?? 0) + verticalChrome,
  }
}

export const getAuthPopupGeometry = (
  input: AuthPopupGeometryInput
): AuthPopupGeometry => {
  const availLeft = input.availLeft ?? 0
  const availTop = input.availTop ?? 0
  const availWidth = toPositiveNumber(input.availWidth, input.innerWidth)
  const availHeight = toPositiveNumber(input.availHeight, input.innerHeight)
  const isMobile = input.innerWidth < MOBILE_BREAKPOINT_PX

  if (isMobile) {
    return {
      width: Math.round(availWidth),
      height: Math.round(availHeight),
      left: Math.round(availLeft),
      top: Math.round(availTop),
    }
  }

  const width = Math.round(
    Math.min(LOGIN_POPUP_WIDTH, availWidth, input.visibleMap?.width ?? Infinity)
  )
  const height = Math.round(
    Math.min(
      LOGIN_POPUP_HEIGHT,
      availHeight,
      input.visibleMap?.height ?? Infinity
    )
  )
  const viewportOffset = getViewportScreenOffset(input)
  const centerX = input.visibleMap
    ? viewportOffset.left + input.visibleMap.centerX
    : availLeft + availWidth / 2
  const centerY = input.visibleMap
    ? viewportOffset.top + input.visibleMap.centerY
    : availTop + availHeight / 2
  const left = clamp(
    centerX - width / 2,
    availLeft,
    availLeft + availWidth - width
  )
  const top = clamp(
    centerY - height / 2,
    availTop,
    availTop + availHeight - height
  )

  return {
    width,
    height,
    left: Math.round(left),
    top: Math.round(top),
  }
}

export const getAuthPopupGeometryFromWindow = (
  currentWindow: Window,
  visibleMap?: MapDims
) => {
  const screenWithOffsets = currentWindow.screen as Screen & {
    availLeft?: number
    availTop?: number
  }

  return getAuthPopupGeometry({
    availHeight: screenWithOffsets.availHeight,
    availLeft: screenWithOffsets.availLeft,
    availTop: screenWithOffsets.availTop,
    availWidth: screenWithOffsets.availWidth,
    innerHeight: currentWindow.innerHeight,
    innerWidth: currentWindow.innerWidth,
    outerHeight: currentWindow.outerHeight,
    outerWidth: currentWindow.outerWidth,
    screenX: currentWindow.screenX,
    screenY: currentWindow.screenY,
    visibleMap,
  })
}

export const formatAuthPopupFeatures = ({
  height,
  left,
  top,
  width,
}: AuthPopupGeometry) =>
  [
    'toolbar=no',
    'location=no',
    'directories=no',
    'status=no',
    'menubar=no',
    'scrollbars=yes',
    'resizable=yes',
    `width=${width}`,
    `height=${height}`,
    `top=${top}`,
    `left=${left}`,
  ].join(',')
