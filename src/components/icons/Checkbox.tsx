import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Checkbox = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="1" y="1" width="22" height="22" rx="2" />
    <rect
      x="1"
      y="1"
      width="22"
      height="22"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

export default Checkbox
