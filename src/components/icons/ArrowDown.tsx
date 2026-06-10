import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const ArrowDown = ({ styleProps, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={9}
    viewBox="0 0 9 4.58579"
    className={cx(css(...pandaStylePropsToArray(styleProps)), className)}
    style={mergePandaStyleProps({ styleProps, style })}
    fill="none"
    {...props}
  >
    <path
      d="M0.5 0.5L3.79289 3.79289C4.18342 4.18342 4.81658 4.18342 5.20711 3.79289L8.5 0.5"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
)

export default ArrowDown
