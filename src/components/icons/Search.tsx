import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'

const Search = ({ styleProps, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    viewBox="0 0 26 26"
    className={cx(css(...pandaStylePropsToArray(styleProps)), className)}
    style={mergePandaStyleProps({ styleProps, style })}
    {...props}
  >
    <g stroke="currentColor" strokeWidth={2}>
      <circle
        cx={8.171}
        cy={8.171}
        r={7.171}
        transform="matrix(.71045 -.70375 .71045 .70375 0 11.5)"
      />
      <path d="m17 17 8 8" />
    </g>
  </svg>
)

export default Search
