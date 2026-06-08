import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const CircleArrowRight = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 12 12"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="6" cy="6" r="5.75" stroke="currentColor" strokeWidth="0.5" />
    <path
      d="M4.28516 3.85547L8.2131 5.81944C8.36051 5.89315 8.36051 6.10351 8.2131 6.17721L4.28516 8.14118"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
    />
  </svg>
)

export default CircleArrowRight
