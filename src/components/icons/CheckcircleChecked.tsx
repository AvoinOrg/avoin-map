import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


type Props = IconProps & {
  fillColor?: string
}

const CheckcircleChecked = ({
  fillColor = 'gray',
  sx,
  className,
  style,
  ...props
}: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={23}
    viewBox="0 0 23 23"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    {...props}
  >
    <circle
      cx={11.5}
      cy={11.5}
      r={10.5}
      fill={fillColor}
      fillOpacity={0.35}
      stroke="currentColor"
      strokeWidth={2}
    />
    <path stroke="currentColor" strokeWidth={2} d="m5 10.5 5 5.5 8-9" />
  </svg>
)

export default CheckcircleChecked
