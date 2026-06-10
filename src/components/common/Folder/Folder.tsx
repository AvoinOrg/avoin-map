// The goal of this component is to be a folder shaped div,
// that can be styled like any other div element. This is not straightforward
// as the folder is an SVG element.
//
// That is why some of the props and styling elements are
// captured and passed to the underlying components.
import React from 'react'
import { css, cx } from 'styled-system/css'

import SvgFolder from './SvgFolder'
import type { PandaStyleObject, PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { appPalette } from '#/common/style/theme/tokens'

const defaultHeight = 86

type Props = {
  height?: number
  children?: React.ReactNode
  styleProps?: PandaStyleProp
}

const rootClass = css({
  position: 'relative',
  width: '100%',
  display: 'inline-block',
})

const contentClass = css({
  position: 'absolute',
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
  overflow: 'auto',
  pt: 3,
})

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
] as const

const paddingPropSet = new Set<string>(paddingProps)

const resolveTokenColor = (color: string) => {
  const [root, shade] = color.split('.')

  if (!root || !shade) {
    return color
  }

  const colorGroup = appPalette[root as keyof typeof appPalette]

  if (colorGroup && shade in colorGroup) {
    return colorGroup[shade as keyof typeof colorGroup]
  }

  return color
}

const splitFolderStyles = (styleProps?: PandaStyleProp) => {
  const paddingStyles: PandaStyleObject = {}
  const mainStyles: PandaStyleObject = {}
  const paddingStyleRecord = paddingStyles as Record<string, unknown>
  const mainStyleRecord = mainStyles as Record<string, unknown>
  let color = appPalette.neutral.darker
  let borderColor = appPalette.neutral.main
  let backgroundColor = appPalette.neutral.lighter

  pandaStylePropsToArray(styleProps).forEach((styleObject) => {
    Object.entries(styleObject).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (key === 'color') {
          color = resolveTokenColor(value)
        }
        if (key === 'borderColor') {
          borderColor = resolveTokenColor(value)
        }
        if (key === 'backgroundColor') {
          backgroundColor = resolveTokenColor(value)
        }
      }

      if (paddingPropSet.has(key)) {
        paddingStyleRecord[key] = value
        return
      }

      if (key !== 'backgroundColor') {
        mainStyleRecord[key] = value
      }
    })
  })

  return {
    backgroundColor,
    borderColor,
    color,
    mainStyles,
    paddingStyles,
  }
}

const Folder = ({ height = defaultHeight, children, styleProps }: Props) => {
  const { backgroundColor, borderColor, mainStyles, paddingStyles } =
    splitFolderStyles(styleProps)

  return (
    <div
      className={cx(rootClass, css(mainStyles))}
      style={mergePandaStyleProps({ styleProps: mainStyles })}
    >
      <SvgFolder
        height={height}
        color={backgroundColor}
        borderColor={borderColor}
      />
      <div
        className={cx(
          contentClass,
          css(paddingStyles),
          'folder-content'
        )}
        style={mergePandaStyleProps({ styleProps: paddingStyles })}
      >
        {children}
      </div>
    </div>
  )
}

export default Folder
