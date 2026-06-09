import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'

const Tune = ({ sx, className, style, ...props }: IconProps) => (
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
      d="M4 7h6M14 7h6M4 17h10M18 17h2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.8}
    />
    <circle cx={12} cy={7} r={2} stroke="currentColor" strokeWidth={1.8} />
    <circle cx={16} cy={17} r={2} stroke="currentColor" strokeWidth={1.8} />
  </svg>
)

export default Tune
