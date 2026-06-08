import type React from 'react'

import { appTypography } from './theme/tokens'
import type { PandaStyleObject, PandaStyleProp } from './panda'

type StyleRecord = Record<string, unknown>

const responsiveKeys = new Set([
  'mobile',
  'desktop',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
])

const spacingAliases: Record<string, Array<keyof React.CSSProperties>> = {
  m: ['margin'],
  mt: ['marginTop'],
  mr: ['marginRight'],
  mb: ['marginBottom'],
  ml: ['marginLeft'],
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  p: ['padding'],
  pt: ['paddingTop'],
  pr: ['paddingRight'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
}

const spacingProps = new Set([
  'gap',
  'rowGap',
  'columnGap',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  ...Object.keys(spacingAliases),
])

const colorProps = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'fill',
  'stroke',
  'outlineColor',
])

const propertyAliases: Record<string, keyof React.CSSProperties> = {
  bg: 'background',
  bgcolor: 'backgroundColor',
  boxSizing: 'boxSizing',
}

const colorTokenRoots = new Set([
  'primary',
  'secondary',
  'neutral',
  'info',
  'warning',
  'error',
  'common',
  'text',
  'action',
  'background',
  'grey',
])

const objectHasOnlyResponsiveKeys = (value: StyleRecord) => {
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every((key) => responsiveKeys.has(key))
}

const isPlainObject = (value: unknown): value is StyleRecord => {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  )
}

const isNestedStyleKey = (key: string) => {
  return (
    key.startsWith('&') ||
    key.startsWith('@') ||
    key.startsWith(':') ||
    key.includes(' ') ||
    key.includes('>')
  )
}

const tokenSegmentToVarName = (segment: string) => {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\./g, '-')
    .toLowerCase()
}

const resolveThemeToken = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  if (value === 'divider') {
    return 'var(--colors-divider)'
  }

  const [root, ...parts] = value.split('.')
  if (!root || parts.length === 0 || !colorTokenRoots.has(root)) {
    return value
  }

  return `var(--colors-${tokenSegmentToVarName([root, ...parts].join('.'))})`
}

const spacingValue = (value: unknown) => {
  if (typeof value !== 'number') {
    return value
  }

  return `${value * 0.5}rem`
}

const isRawCssString = (value: string) => {
  return (
    value.includes(' ') ||
    value.includes('(') ||
    value.startsWith('var(') ||
    value === 'auto' ||
    value === 'inherit' ||
    value === 'initial' ||
    value === 'unset'
  )
}

const cssValue = (key: string, value: unknown) => {
  if (colorProps.has(key)) {
    return resolveThemeToken(value)
  }

  if (spacingProps.has(key)) {
    return spacingValue(value)
  }

  if (key === 'fontFamily' && value === 'primary') {
    return 'var(--fonts-primary)'
  }

  if (key === 'zIndex' && typeof value === 'string') {
    if (isRawCssString(value)) {
      return value
    }

    return `var(--z-index-${tokenSegmentToVarName(value)})`
  }

  if (key === 'boxShadow' && typeof value === 'string') {
    if (value === 'none' || isRawCssString(value)) {
      return value
    }

    return `var(--shadows-${tokenSegmentToVarName(value)})`
  }

  return value
}

const applyTypography = (
  style: React.CSSProperties,
  value: unknown
) => {
  if (typeof value !== 'string') {
    return
  }

  const variant = appTypography[value as keyof typeof appTypography]
  if (typeof variant === 'string' || variant == null) {
    return
  }

  style.fontFamily = variant.fontFamily
  style.fontSize = variant.fontSize
  style.fontWeight = variant.fontWeight
  style.lineHeight = variant.lineHeight
  style.letterSpacing = variant.letterSpacing
}

const applyStyleEntry = (
  style: React.CSSProperties,
  key: string,
  value: unknown
) => {
  if (value == null || isNestedStyleKey(key)) {
    return
  }

  if (isPlainObject(value)) {
    if (objectHasOnlyResponsiveKeys(value)) {
      return
    }

    return
  }

  if (key === 'typography' || key === 'textStyle') {
    applyTypography(style, value)
    return
  }

  const spacingAlias = spacingAliases[key]
  if (spacingAlias) {
    spacingAlias.forEach((property) => {
      style[property] = spacingValue(value) as never
    })
    return
  }

  const property = propertyAliases[key] ?? key
  style[property as keyof React.CSSProperties] = cssValue(
    property,
    value
  ) as never
}

export const pandaStylePropsToArray = (
  sx?: PandaStyleProp
): PandaStyleObject[] => {
  if (sx == null) {
    return []
  }

  const styles = Array.isArray(sx) ? sx : [sx]

  return styles.filter(isPlainObject) as PandaStyleObject[]
}

export const pandaStylePropsToCssStyle = (
  sx?: PandaStyleProp
): React.CSSProperties | undefined => {
  const style: React.CSSProperties = {}

  pandaStylePropsToArray(sx).forEach((styleObject) => {
    Object.entries(styleObject as StyleRecord).forEach(([key, value]) => {
      applyStyleEntry(style, key, value)
    })
  })

  return Object.keys(style).length > 0 ? style : undefined
}

export const mergePandaStyleProps = ({
  sx,
  style,
}: {
  sx?: PandaStyleProp
  style?: React.CSSProperties
}): React.CSSProperties | undefined => {
  const sxStyle = pandaStylePropsToCssStyle(sx)

  if (sxStyle == null) {
    return style
  }

  if (style == null) {
    return sxStyle
  }

  return {
    ...sxStyle,
    ...style,
  }
}
