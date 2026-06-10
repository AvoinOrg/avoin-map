import * as React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type Props = {
  styleProps?: PandaStyleProp
} & Omit<React.SVGProps<SVGSVGElement>, 'color'>

const LoadingHorizontal = ({ styleProps, className, style, ...props }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    role="progressbar"
    aria-label={props['aria-label'] ?? 'Loading'}
    className={cx(css(...pandaStylePropsToArray(styleProps)), className)}
    style={mergePandaStyleProps({ styleProps, style })}
    {...props}
  >
    <circle cx="4" cy="12" r="3" fill="currentColor">
      <animate
        attributeName="opacity"
        values="1;1;0.2;1"
        dur="0.8s"
        begin="-0.8s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="12" cy="12" r="3" fill="currentColor">
      <animate
        attributeName="opacity"
        values="1;1;0.2;1"
        dur="0.8s"
        begin="-0.65s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="20" cy="12" r="3" fill="currentColor">
      <animate
        attributeName="opacity"
        values="1;1;0.2;1"
        dur="0.8s"
        begin="-0.5s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
)

export default LoadingHorizontal
