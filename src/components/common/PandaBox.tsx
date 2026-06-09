import React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type PandaBoxOwnProps<T extends React.ElementType> = {
  component?: T
  sx?: PandaStyleProp
  className?: string
  style?: React.CSSProperties
}

export type PandaBoxProps<T extends React.ElementType = 'div'> =
  PandaBoxOwnProps<T> &
    Omit<
      React.ComponentPropsWithoutRef<T>,
      keyof PandaBoxOwnProps<T> | 'color'
    >

const PandaBoxInner = <T extends React.ElementType = 'div'>(
  {
    component,
    sx,
    className,
    style,
    ...props
  }: PandaBoxProps<T>,
  ref: React.ForwardedRef<Element>
) => {
  const Component = (component ?? 'div') as React.ElementType

  return React.createElement(Component, {
    ...props,
    ref,
    className: cx(css(...pandaStylePropsToArray(sx)), className),
    style: mergePandaStyleProps({ sx, style }),
  })
}

export const PandaBox = React.forwardRef(PandaBoxInner) as <
  T extends React.ElementType = 'div',
>(
  props: PandaBoxProps<T> & { ref?: React.Ref<Element> }
) => React.ReactElement | null

export const Box = PandaBox

export default PandaBox
