import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Home = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={15}
    viewBox="0 0 14 15"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    {...props}
  >
    <path
      d="M0.6 6.90993V12.3449C0.6 13.1733 1.27157 13.8449 2.1 13.8449H11.4526C12.2811 13.8449 12.9526 13.1733 12.9526 12.3449V6.90993C12.9526 6.51942 12.8003 6.1443 12.5281 5.86431L7.85181 1.05438C7.2628 0.448539 6.28984 0.44854 5.70083 1.05438L1.02451 5.86431C0.752292 6.1443 0.6 6.51942 0.6 6.90993Z"
      stroke="currentColor"
      strokeWidth={1.2}
    />
  </svg>
)

export default Home
