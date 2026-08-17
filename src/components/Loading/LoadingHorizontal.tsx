import * as React from 'react'
import { Box, type AppSxProps, toSxArray } from '#/common/style/theme'

type LoadingHorizontalProps = Omit<
  React.ComponentProps<'svg'>,
  'display'
> & {
  sx?: AppSxProps
}

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

const toLoadingSxArray = (sx?: AppSxProps) => toSxArray(sx) as AppSxItem[]

const DOT_ANIMATION_DURATION = '0.8s'
const DOT_OPACITY = '0.2'

const LoadingHorizontal = ({
  sx,
  width = 24,
  height = 24,
  fill = 'none',
  viewBox = '0 0 24 24',
  className,
  style,
  ...svgProps
}: LoadingHorizontalProps) => {
  const baseSvgProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '100%',
    height: '100%',
    viewBox,
  }

  return (
    <Box
      component="span"
      className={className}
      style={{ fill, ...style }}
      sx={[
        {
          display: 'inline-flex',
          color: 'currentColor',
          width,
          height,
          lineHeight: 0,
        },
        ...toLoadingSxArray(sx),
      ]}
    >
      <svg {...baseSvgProps} fill={fill} {...svgProps}>
        <circle cx="4" cy="12" r="3" fill="currentColor">
          <animate
            attributeName="opacity"
            dur={DOT_ANIMATION_DURATION}
            repeatCount="indefinite"
            values={`1;${DOT_OPACITY};1`}
            keyTimes="0;0.75;1"
            begin="0s"
          />
        </circle>
        <circle cx="12" cy="12" r="3" fill="currentColor">
          <animate
            attributeName="opacity"
            dur={DOT_ANIMATION_DURATION}
            repeatCount="indefinite"
            values={`1;${DOT_OPACITY};1`}
            keyTimes="0;0.75;1"
            begin="-0.266s"
          />
        </circle>
        <circle cx="20" cy="12" r="3" fill="currentColor">
          <animate
            attributeName="opacity"
            dur={DOT_ANIMATION_DURATION}
            repeatCount="indefinite"
            values={`1;${DOT_OPACITY};1`}
            keyTimes="0;0.75;1"
            begin="-0.532s"
          />
        </circle>
      </svg>
    </Box>
  )
}

export default LoadingHorizontal
