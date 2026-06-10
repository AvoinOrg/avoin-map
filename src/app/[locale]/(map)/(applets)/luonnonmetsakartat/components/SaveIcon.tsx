import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from '#/components/icons/types'

const SaveIcon = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M5 3h12l2 2v16H5V3Z"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <path
      d="M8 3v6h8V3M8 21v-7h8v7"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </svg>
)

export default SaveIcon
