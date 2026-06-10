import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const DownIcon = ({ styleProps, className, style, ...props }: IconProps) => (
  <svg
    width={17}
    height={11}
    viewBox="0 0 17 11"
    className={cx(css(...pandaStylePropsToArray(styleProps)), className)}
    style={mergePandaStyleProps({ styleProps, style })}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M16 1 8.5 9 1 1" stroke="currentColor" strokeWidth={2} />
  </svg>
)

export default DownIcon
