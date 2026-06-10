import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Pointer = ({ styleProps, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={31}
    height={30}
    fill="none"
    className={cx(css(...pandaStylePropsToArray(styleProps)), className)}
    style={mergePandaStyleProps({ styleProps, style })}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={2}
      d="m15.171 16.311-1.408 9.008L2.826 9.73l19.243-.505-6.898 7.087Zm0 0 11.449 6.05"
    />
  </svg>
);
export default Pointer;
