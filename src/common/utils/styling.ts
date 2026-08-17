import type { AppTheme } from '#/common/style/theme'

// Used for resolving color strings in components,
// where MUI theme might not work directly
export const resolveColor = (color: string, theme: AppTheme) => {
  const parts = color.split('.')
  if (parts.length === 2) {
    const [colorKey, shade] = parts
    const colorGroup = theme.palette[colorKey as keyof AppTheme['palette']]

    if (colorGroup && typeof colorGroup === 'object' && shade in colorGroup) {
      return colorGroup[shade as keyof typeof colorGroup] as string
    }
  }

  return color
}

let textMeasurementCanvas: HTMLCanvasElement | null = null

export const getTextWidth = (text: string, font: string): number => {
  if (!textMeasurementCanvas) {
    textMeasurementCanvas = document.createElement('canvas')
  }
  const context = textMeasurementCanvas.getContext('2d')
  if (!context) {
    return 0 // Fallback in case the context is not available
  }

  context.font = font
  const metrics = context.measureText(text)
  return metrics.width
}

export const cssMeasureToNumber = (measure: string) => {
  if (measure.endsWith('px')) {
    return parseFloat(measure.slice(0, -2))
  }
  if (measure.endsWith('rem')) {
    return (
      parseFloat(measure.slice(0, -3)) *
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    )
  }
  return parseFloat(measure)
}

export const getContrastColor = (hexColor: string): string => {
  // Remove the hash if it exists
  const color = hexColor.replace('#', '')

  // Parse the RGB values
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // Calculate the relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light backgrounds and white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
