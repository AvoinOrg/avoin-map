import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Login = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={16}
    viewBox="0 0 13 16"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    {...props}
  >
    <path
      d="M6.33105 7.82617C8.16464 7.82622 9.52113 8.63788 10.5059 9.92383C11.506 11.23 12.1244 13.0331 12.3965 14.9619C12.4284 15.1881 12.252 15.4004 12.002 15.4004H1.00781C0.752993 15.4004 0.564431 15.1748 0.605469 14.9307C0.934977 12.9702 1.47879 11.174 2.38867 9.87988C3.27568 8.61841 4.51254 7.82617 6.33105 7.82617ZM6.33105 0.599609C7.96906 0.599703 9.30762 1.9436 9.30762 3.61328C9.30742 5.23072 8.05111 6.54179 6.4834 6.62207L6.33105 6.62598L6.17871 6.62207C4.61084 6.54196 3.35469 5.23084 3.35449 3.61328C3.35449 1.94354 4.69297 0.599609 6.33105 0.599609Z"
      stroke="currentColor"
      strokeWidth={1.2}
    />
  </svg>
)

export default Login
