import { css, cx } from 'styled-system/css'

import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { IconProps } from './types'


const Tip = ({ sx, className, style, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={23}
    fill="none"
    viewBox="0 0 24 23"
    className={cx(css(...pandaStylePropsToArray(sx)), className)}
    style={mergePandaStyleProps({ sx, style })}
    {...props}
  >
    <path
      d="M5.57709 4.7309L3.88477 3.03857"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.3457 2.19233V0.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.84248 19.5068V22.4998H14.8027V19.5068C14.8027 18.6923 15.5344 17.1586 16.381 16.1684C18.3656 13.8467 20.3856 5.57796 12.2099 5.57764C4.31773 5.57733 6.0014 13.6302 8.03876 16.1684C9.38549 17.8462 9.84248 18.3543 9.84248 19.5068Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.3457 8.11523C13.4076 8.2178 15.5711 9.03832 15.7304 11.4999"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9.80859 19.9619H14.8856" stroke="currentColor" />
    <path
      d="M5.57709 17.4233L3.88477 19.1157"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.03849 11.5H0.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.2686 5.57709L19.9609 3.88477"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.1148 18.2695L19.9609 19.9619"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.8072 11.5H23.3457"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default Tip
