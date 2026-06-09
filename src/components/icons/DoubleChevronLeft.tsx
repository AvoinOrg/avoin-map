import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'

const DoubleChevronLeft = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="m11 6-5 6 5 6M18 6l-5 6 5 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
    />
  </svg>
)

export default DoubleChevronLeft
