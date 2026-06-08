import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Sandwich = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    width="44"
    height="16"
    viewBox="0 0 44 16"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="44" height="6" fill="currentColor" />
    <rect y="10" width="44" height="6" fill="currentColor" />
  </svg>
)

export default Sandwich
