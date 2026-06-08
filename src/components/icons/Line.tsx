import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Line = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 30 27"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="1"
      y="1"
      width="6.08806"
      height="6.08806"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="22.3086"
      y="19.7422"
      width="6.08806"
      height="6.08806"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M5.87109 6.30188L22.8711 20.3019"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

export default Line
