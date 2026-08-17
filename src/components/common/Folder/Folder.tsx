import React from 'react'

import SvgFolder from './SvgFolder'
import { resolveColor } from '#/common/utils/styling'
import {
  Box,
  toSxArray,
  type AppSxProps,
  type AppTheme,
  useTheme,
} from '#/common/style/theme/system'

const defaultHeight = 86

type Props = {
  height?: number
  children?: React.ReactNode
  sx?: AppSxProps
}

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
const toAppSxItemArray = (sx?: AppSxProps) => toSxArray(sx) as AppSxItem[]

const isStyleObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

const Folder = ({ height = defaultHeight, children, sx }: Props) => {
  const theme = useTheme<AppTheme>()
  let color: string | undefined
  let borderColor = theme.palette.neutral.main
  let backgroundColor = theme.palette.neutral.lighter

  const resolvedSx = toAppSxItemArray(sx).reduce<Record<string, unknown>>(
    (acc, style) => {
      if (style == null) {
        return acc
      }

      if (typeof style === 'function') {
        const evaluated = style(theme)

        if (isStyleObject(evaluated)) {
          return { ...acc, ...evaluated }
        }

        return acc
      }

      if (isStyleObject(style)) {
        return { ...acc, ...style }
      }

      return acc
    },
    {}
  )

  // Preserve legacy behavior: resolve theme-based tokens from style values.
  if ('color' in resolvedSx && typeof resolvedSx.color === 'string') {
    color = resolveColor(resolvedSx.color, theme)
  }
  if (
    'borderColor' in resolvedSx &&
    typeof resolvedSx.borderColor === 'string'
  ) {
    borderColor = resolveColor(resolvedSx.borderColor, theme)
  }
  if (
    'backgroundColor' in resolvedSx &&
    typeof resolvedSx.backgroundColor === 'string'
  ) {
    backgroundColor = resolveColor(resolvedSx.backgroundColor, theme)
  }

  const paddingProps = [
    'p',
    'px',
    'py',
    'pt',
    'pb',
    'pl',
    'pr',
    'padding',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
  ]
  const paddingStyles: Record<string, unknown> = {}
  const mainStyles: Record<string, unknown> = {}

  Object.keys(resolvedSx).forEach((key) => {
    const value = resolvedSx[key]

    if (paddingProps.includes(key)) {
      paddingStyles[key] = value
    } else {
      mainStyles[key] = value
    }
  })

  delete mainStyles.backgroundColor
  if (color != null) {
    delete mainStyles.color
  }

  return (
    <Box
      sx={[
        {
          position: 'relative',
          width: '100%',
          display: 'inline-block',
        },
        mainStyles,
        ...(color != null ? [{ color }] : []),
      ]}
    >
      <SvgFolder
        height={height}
        color={backgroundColor}
        borderColor={borderColor}
      />
      <Box
        sx={[
          {
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            overflow: 'auto',
            pt: 3,
          },
          paddingStyles,
        ]}
        className="folder-content"
      >
        {children}
      </Box>
    </Box>
  )
}

export default Folder
