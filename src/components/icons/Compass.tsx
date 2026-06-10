import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'

const Compass = ({ styleProps, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    className={cx(css(...pandaStylePropsToArray(styleProps)), className)}
    style={mergePandaStyleProps({ styleProps, style })}
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M12 3v3M12 18v3M3 12h3M18 12h3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.8}
    />
    <circle cx={12} cy={12} r={6.5} stroke="currentColor" strokeWidth={1.8} />
    <path
      d="m15.2 7.9-1.6 5.7-4.8 2.5 1.6-5.7 4.8-2.5Z"
      fill="currentColor"
    />
  </svg>
)

export default Compass
