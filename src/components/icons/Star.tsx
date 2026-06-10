import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Star = ({ styleProps, className, style, ...props }: IconProps) => (
  <svg
    width={26}
    height={26}
    viewBox="0 0 26 26"
    className={cx(css(...pandaStylePropsToArray(styleProps)), className)}
    style={mergePandaStyleProps({ styleProps, style })}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={2}
      d="m13 3.236 1.968 6.056.224.69h7.094l-5.151 3.743-.588.428.224.69L18.74 20.9l-5.151-3.742L13 16.73l-.588.427-5.151 3.742 1.968-6.056.224-.69-.588-.428-5.151-3.742h7.094l.224-.691L13 3.236Z"
    />
  </svg>
)
export default Star
