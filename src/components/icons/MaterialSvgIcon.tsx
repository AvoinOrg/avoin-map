import type { ComponentProps } from 'react'

import { toSxArray } from '#/common/style/theme'

import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'

type Props = ComponentProps<'svg'> & SharedSvgIconProps

const materialSvgIconSx = {
  display: 'inline-block',
  flexShrink: 0,
  width: '1em',
  height: '1em',
  fontSize: '1.5rem',
  userSelect: 'none',
  fill: 'currentColor',
} as const

export const MaterialSvgIcon = ({ sx, ...props }: Props) => (
  <SharedSvgIcon
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    {...props}
    sx={[materialSvgIconSx, ...toSxArray(sx)]}
  />
)

