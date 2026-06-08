import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Bullseye = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={23}
    viewBox="0 0 23 23"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    {...props}
  >
    <g stroke="currentColor" strokeWidth={2}>
      <circle cx={11.5} cy={11.5} r={7.5} />
      <circle cx={11.5} cy={11.5} r={3.5} />
      <path d="M11.5 4V0m0 19v4M19 11.5h4m-19 0H0" />
    </g>
  </svg>
)

export default Bullseye
